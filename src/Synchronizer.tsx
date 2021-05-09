import A from 'automerge'
import { Client } from '@localfirst/relay-client'
import EventEmitter from 'eventemitter3'

export class Synchronizer extends EventEmitter {
  private client: Client
  private sockets: Record<string, WebSocket> = {}
  private syncStates: Record<string, A.SyncState> = {}
  private userName: string
  private discoveryKey: string
  private doc: A.Doc<any>

  /**
   * Connects to peers via a @localfirst/relay, and keeps the
   */
  constructor({ urls, userName, doc, discoveryKey }: SynchronizerOptions) {
    super()
    this.discoveryKey = discoveryKey
    this.userName = userName
    this.doc = doc

    // connect to relay server
    this.client = this.connectServer(urls[0])
  }

  public change(cb: A.ChangeFn<any>) {
    this.doc = A.change(this.doc, cb)
    this.sync()
    return this.doc
  }

  private get peerUserNames() {
    return Object.keys(this.sockets)
  }

  private connectServer(url: string): Client {
    const client = new Client({ userName: this.userName, url })
    client
      .on('server.connect', () => {
        client.join(this.discoveryKey)
      })
      .on('peer.connect', ({ userName, socket }) => {
        this.connectPeer(socket, userName)
      })
    return client
  }

  public disconnectServer() {
    // when the relay server closes our connection, close all our sockets
    this.peerUserNames.forEach(userName => this.disconnectPeer(userName))
  }

  private connectPeer(socket: WebSocket, peerUserName: string) {
    // keep track of the socket and its associated sync state
    this.sockets[peerUserName] = socket
    this.syncStates[peerUserName] = A.initSyncState()
    socket.addEventListener('message', event => {
      const message: A.BinarySyncMessage = event.data
      const prevSyncState = this.syncStates[peerUserName]
      const [doc, syncState] = A.receiveSyncMessage(this.doc, prevSyncState, message)
      this.doc = doc
      this.syncStates[peerUserName] = syncState
      this.sync()
    })
    socket.addEventListener('close', () => {
      this.disconnectPeer(peerUserName)
    })
  }

  private sync() {
    this.peerUserNames.forEach(userName => {
      const socket = this.sockets[userName]
      const prevSyncState = this.syncStates[userName]
      const [syncState, message] = A.generateSyncMessage(this.doc, prevSyncState)
      this.syncStates[userName] = syncState
      if (message) socket.send(message)
    })
  }

  private disconnectPeer(userName: string) {
    // close the socket and forget it existed
    const socket = this.sockets[userName]
    if (socket) {
      if (socket.readyState === WebSocket.OPEN) socket.close()
      delete this.sockets[userName]
      delete this.syncStates[userName]
    }

    // notify relay server
    this.client.disconnectPeer(userName)
  }
}

interface SynchronizerOptions {
  /** A unique string identifying the document we're collaborating on */
  discoveryKey: string
  /** An array of URLs of known relay servers */
  urls: string[]
  /** A unique string identifying the local user (could be a UUID, a user id, an email address, etc.) */
  userName: string
  /** The doc to keep synchronized */
  doc: A.Doc<any>
}
