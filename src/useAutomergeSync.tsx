import * as A from 'automerge'
import React from 'react'
import { AutomergeSync, AutomergeSyncOptions } from './AutomergeSync'
import { State } from './types'

export function useAutomergeSync<T>({
  state: initialState = A.init(),
  urls,
  userId,
  key,
}: AutomergeSyncOptions<T>) {
  const [state, setState] = React.useState(initialState)
  const [synchronizer] = React.useState(() => new AutomergeSync({ urls, userId, key, state }))

  // when we get changes from the ui, update our peers
  const change = (cb: A.ChangeFn<State>) => {
    const newState = synchronizer.change(cb)
    setState(newState)
  }

  // when we get changes from peers, update the ui
  synchronizer.on('change', (newState: A.Doc<T>) => {
    setState(newState)
  })

  return { state, change }
}
