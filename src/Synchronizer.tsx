import * as A from 'automerge'
import { Client, PeerEventPayload } from '@localfirst/relay-client'
import EventEmitter from 'eventemitter3'

export class Synchronizer extends EventEmitter {
  private client: Client
  private peers: Record<string, Peer> = {}
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

  public change(cb: A.ChangeFn<any>) {
    this.doc = A.change(this.doc, cb)
    this.sync()
    return this.doc
  }

  private get peerIds() {
    return Object.keys(this.peers)
  }

  private connectServer(url: string): Client {
    const client = new Client({ userName: this.userId, url })
    client
      .on('server.connect', () => {
        client.join(this.discoveryKey)
      })
      .on('peer.connect', ({ userName: userId, socket }: PeerEventPayload) => {
        socket.binaryType = 'arraybuffer'
        this.connectPeer(socket, userId)
      })
    return client
  }

  public disconnectServer() {
    // when the relay server closes our connection, close all our sockets
    this.peerIds.forEach(peerId => this.disconnectPeer(peerId))
  }

  private connectPeer(socket: WebSocket, peerId: string) {
    const peer = { peerId, socket, syncState: A.initSyncState() }
    this.peers[peerId] = peer

    // handle incoming messages
    socket.addEventListener('message', async event => {
      const message = new Uint8Array(event.data) as A.BinarySyncMessage

      // apply any changes to our internal state
      const [doc, nextSyncState] = A.receiveSyncMessage(this.doc, peer.syncState, message)
      this.doc = doc
      peer.syncState = nextSyncState

      // update our peers
      this.sync()

      // update the application
      this.emit('change', this.doc)
    })

    socket.addEventListener('close', () => {
      this.disconnectPeer(peerId)
    })
  }

  private sync() {
    this.peerIds.forEach(peerId => {
      const peer = this.peers[peerId]
      if (!peer) return
      const { socket, syncState } = peer
      const [nextSyncState, message] = A.generateSyncMessage(this.doc, syncState)
      peer.syncState = nextSyncState
      if (message) socket.send(message)
    })
  }

  private disconnectPeer(peerId: string) {
    // close the socket and forget it existed
    const peer = this.peers[peerId]
    if (!peer) return
    const { socket } = peer
    if (socket.readyState === WebSocket.OPEN) {
      socket.close()
      delete this.peers[peerId]
    }

    // notify relay server
    this.client.disconnectPeer(peerId)
  }
}

interface SynchronizerOptions {
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
  peerId: string
  socket: WebSocket
  syncState: A.SyncState
}
