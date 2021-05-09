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
  const [synchronizer] = React.useState(() => new AutomergeSync({ urls, userId, key, state }))

  // when we get changes from the application, update our peers
  const change = (cb: A.ChangeFn<State>) => {
    const newState = synchronizer.change(cb)
    setState(newState)
  }

  // when we get changes from peers, update the application
  synchronizer.on('change', (newState: A.Doc<T>) => {
    setState(newState)
  })

  return { state, change }
}

type UseAutomergeSyncOptions = Rename<AutomergeSyncOptions, 'state', 'defaultState'>

// https://stackoverflow.com/a/59071783/239663
type Rename<T, K extends keyof T, R extends PropertyKey> = Omit<T, K> & { [P in R]: T[K] }
