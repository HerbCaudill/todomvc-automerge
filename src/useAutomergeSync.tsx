import * as A from 'automerge'
import React from 'react'
import { AutomergeSync, AutomergeSyncOptions } from './AutomergeSync'
import { State } from './types'

export function useAutomergeSync<T>({
  defaultState = A.init(),
  urls,
  userId,
  key,
}: UseAutomergeSyncOptions) {
  const [state, setState] = React.useState<A.Doc<T>>(defaultState)
  const [connected, setConnected] = React.useState(false)
  const [peerIds, setPeerIds] = React.useState<string[]>([])

  const [synchronizer] = React.useState(() => {
    const synchronizer = new AutomergeSync({ urls, userId, key, state })
    synchronizer
      // when we get changes from peers, update the application
      .on('change', (newState: A.Doc<T>) => {
        setState(newState)
      })
      .on('server.connect', () => {
        setConnected(true)
      })
      .on('server.disconnect', () => {
        setConnected(false)
      })
      .on('peer.connect', peerId => {
        setPeerIds(synchronizer.peerIds)
      })
      .on('peer.disconnect', peerId => {
        setPeerIds(synchronizer.peerIds)
      })

    return synchronizer
  })

  // when we get changes from the application, update our peers
  const change = (cb: A.ChangeFn<State>) => {
    const newState = synchronizer.change(cb)
    setState(newState)
  }

  return {
    state,
    change,
    connected,
    peerIds,
  }
}

type UseAutomergeSyncOptions = Rename<AutomergeSyncOptions, 'state', 'defaultState'>

/** Rename one property of a type (see https://stackoverflow.com/a/59071783/239663) */
type Rename<T, K extends keyof T, R extends PropertyKey> = Omit<T, K> & { [P in R]: T[K] }
