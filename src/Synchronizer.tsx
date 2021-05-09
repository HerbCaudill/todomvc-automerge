import * as A from 'automerge'
import { Client, PeerEventPayload } from '@localfirst/relay-client'
import EventEmitter from 'eventemitter3'

export class Synchronizer extends EventEmitter {
  private client: Client
  private peers: Map<string, Peer> = new Map()
  private userId: string
  private discoveryKey: string
  private doc: A.Doc<any>

  /**
   * Connects to peers via a @localfirst/relay to keep an Automerge document in sync
   */
  constructor({ urls, userId: userId, doc, discoveryKey }: SynchronizerOptions) {
    super()
    this.discoveryKey = discoveryKey
    this.userId = userId
    this.doc = doc

    // connect to relay server
    this.client = this.connectServer(urls[0])
  }

  /** Applies changes coming from the application to our document, and sends updates to all peers. */
  public change(cb: A.ChangeFn<any>) {
    this.doc = A.change(this.doc, cb)
    this.sync()
    return this.doc
  }

  private connectServer(url: string): Client {
    const client = new Client({ userName: this.userId, url })

      // once we connect to the relay server, tell them what we're interested in
      .on('server.connect', () => {
        client.join(this.discoveryKey)
      })

      // each time the relay server connects us to a peer, register the peer and listen for messages
      .on('peer.connect', ({ userName: peerId, socket }: PeerEventPayload) => {
        socket.binaryType = 'arraybuffer'
        this.connectPeer(socket, peerId)
      })

      // when the peer disconnects, clean up
      .on('peer.disconnect', ({ userName: peerId }) => {
        this.disconnectPeer(peerId)
      })

      // when the server disconnects, clean up
      .on('server.disconnect', () => {
        this.disconnectServer()
      })

    return client
  }

  /** Cleans up when the relay server disconnects from us */
  public disconnectServer() {
    // when the relay server closes our connection, close all our sockets
    for (const [peerId] of this.peers) {
      this.disconnectPeer(peerId)
    }
  }

  /** Registers a new peer and listens for incoming messages */
  private connectPeer(socket: WebSocket, peerId: string) {
    const peer = { peerId, socket, syncState: A.initSyncState() }
    this.peers.set(peerId, peer)

    // handle incoming messages
    socket.addEventListener('message', async event => {
      const message = new Uint8Array(event.data) as A.BinarySyncMessage
      this.receive(peer, message)
    })

    socket.addEventListener('close', () => {
      this.disconnectPeer(peerId)
    })
  }

  /** Disconnects from a peer */
  private disconnectPeer(peerId: string) {
    const peer = this.peers.get(peerId)
    if (!peer) return

    // close the socket
    const { socket } = peer
    if (socket.readyState === WebSocket.OPEN) socket.close()

    // forget about this peer
    this.peers.delete(peerId)

    // notify relay server
    this.client.disconnectPeer(peerId)
  }

  /** Sends a sync message to a peer */
  private send(peer: Peer, message: A.BinarySyncMessage) {
    if (peer.socket.readyState === WebSocket.OPEN) {
      peer.socket.send(message)
    }
  }

  /** Handles an incoming sync message from a peer */
  private receive(peer: Peer, message: A.BinarySyncMessage) {
    // using the message, update our document and sync state for the peer
    const [doc, nextSyncState] = A.receiveSyncMessage(this.doc, peer.syncState, message)
    this.doc = doc
    peer.syncState = nextSyncState

    // send update to the application
    this.emit('change', this.doc)

    // send updates to all our peers
    this.sync()
  }

  private sync() {
    for (const [_peerId, peer] of this.peers) {
      // generate a message for each peer with anything they might not know
      const [nextSyncState, message] = A.generateSyncMessage(this.doc, peer.syncState)

      // update our sync state for this peer
      peer.syncState = nextSyncState

      // only send a message if something has changed
      if (message) this.send(peer, message)
    }
  }
}

export interface SynchronizerOptions {
  /** A unique string identifying the document we're collaborating on */
  discoveryKey: string

  /** An array of URLs of known relay servers */
  urls: string[]

  /** A unique string identifying the local user (could be a UUID, a user id, an email address, etc.) */
  userId: string

  /** The doc to keep synchronized */
  doc: A.Doc<any>
}

interface Peer {
  /** A unique string identifying the peer (corresponds to our userId) */
  peerId: string

  /** The WebSocket we're using to communicate with the peer */
  socket: WebSocket

  /** The Automerge sync state we're keeping track of for this peer */
  syncState: A.SyncState
}
