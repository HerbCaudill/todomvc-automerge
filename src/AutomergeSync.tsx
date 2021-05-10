import { Client, PeerEventPayload } from '@localfirst/relay-client'
import * as A from 'automerge'
import EventEmitter from 'eventemitter3'

export class AutomergeSync<T = any> extends EventEmitter {
  private key: string
  private userId: string
  private state: A.Doc<any>
  private urls: string[]

  private client: Client
  private peers: Map<string, Peer> = new Map()

  /** Our online/offline status, for use by the application */
  public connected = false

  /**
   * Connects to peers via a @localfirst/relay to keep an Automerge document in sync
   */
  constructor({ urls, userId, state, key }: AutomergeSyncOptions<T>) {
    super()
    this.key = key
    this.userId = userId
    this.state = state
    this.urls = urls

    // connect to relay server
    this.client = this.createRelayClient()
  }

  // PUBLIC

  /** List of our peer IDs for use by the application */
  public get peerIds() {
    return Array.from(this.peers.keys())
  }

  /** Apply changes coming from the application to our document, and send updates to all peers. */
  public change(cb: A.ChangeFn<any>) {
    // apply the change to our document
    this.state = A.change(this.state, cb)

    // send updates to all our peers
    this.sync()

    return this.state
  }

  /** Connect to a @localfirst/relay server to see if there are peers to connect to */
  public connectRelay() {
    this.client = this.createRelayClient()
  }

  /** Clean up when the relay server is disconected from us */
  public disconnectRelay() {
    // close all our sockets
    for (const [peerId] of this.peers) {
      this.disconnectPeer(peerId)
    }
    this.emit('server.disconnect')
    this.connected = false
  }

  // PRIVATE

  private createRelayClient() {
    const url = this.urls[0] // TODO support multiple relay servers

    const client = new Client({ userName: this.userId, url })

    client
      // once we connect to the relay server, tell them what we're interested in
      .on('server.connect', () => {
        this.connected = true
        client.join(this.key)
        this.emit('server.connect')
      })

      // each time the relay server connects us to a peer, register the peer and listen for messages
      .on('peer.connect', ({ userName: peerId, socket }: PeerEventPayload) => {
        this.connectPeer(socket, peerId)
        this.emit('peer.connect', peerId)
      })

      // when the peer disconnects, clean up
      .on('peer.disconnect', ({ userName: peerId }: PeerEventPayload) => {
        this.disconnectPeer(peerId)
        this.emit('peer.disconnect', peerId)
      })

      // when the server disconnects, clean up
      .on('server.disconnect', () => {
        this.disconnectRelay()
      })

    return client
  }

  /** Register a new peer and listens for incoming messages */
  private connectPeer(socket: WebSocket, peerId: string) {
    socket.binaryType = 'arraybuffer' // Automerge sync messages are byte arrays

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

    this.sync()
  }

  /** Clean up when a peer is disconnected from a peer */
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

  /** Check the known state of each peer and sends them a sync message if necessary */
  private sync() {
    for (const [_peerId, peer] of this.peers) {
      // compares the current state of our document to each peer's last known state, and if we think
      // there are changes they don't have, generate a sync message
      const [nextSyncState, message] = A.generateSyncMessage(this.state, peer.syncState)

      // update this peer's sync state
      peer.syncState = nextSyncState

      // only send a message if something has changed (if no changes, message will be null)
      if (message) this.send(peer, message)
    }
  }

  /** Send a sync message to a peer */
  private send(peer: Peer, message: A.BinarySyncMessage) {
    if (peer.socket.readyState === WebSocket.OPEN) {
      peer.socket.send(message)
    }
  }

  /** Handle an incoming sync message from a peer */
  private receive(peer: Peer, message: A.BinarySyncMessage) {
    // using the message, update our document and sync state for the peer
    const [state, nextSyncState] = A.receiveSyncMessage(this.state, peer.syncState, message)
    this.state = state
    peer.syncState = nextSyncState

    // send update to the application
    this.emit('change', this.state)

    // send updates to all our peers
    this.sync()
  }
}

export interface AutomergeSyncOptions<T = any> {
  /** A unique string identifying the document we're collaborating on */
  key: string

  /** An array of URLs of known relay servers */
  urls: string[]

  /** A unique string identifying the local user (could be a UUID, a user id, an email address, etc.) */
  userId: string

  /** The state to keep synchronized */
  state: A.Doc<T>
}

interface Peer {
  /** A unique string identifying the peer (= their userId) */
  peerId: string

  /** The WebSocket we're using to communicate with the peer */
  socket: WebSocket

  /** The Automerge sync state we're keeping track of for this peer */
  syncState: A.SyncState
}
