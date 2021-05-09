import React from 'react'
import * as A from 'automerge'
import { State } from './types'
import { AutomergeSync } from './AutomergeSync'

export function useAutomergeSync<T>({
  defaultState = A.init(),
  urls,
  userId,
  key,
}: UseSynchronizerOptions<T>) {
  const [state, setState] = React.useState(defaultState)
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

interface UseSynchronizerOptions<T> {
  /** A unique string identifying the document we're collaborating on */
  key: string

  /** An array of URLs of known relay servers */
  urls: string[]

  /** A unique string identifying the local user (could be a UUID, a user id, an email address, etc.) */
  userId: string

  /** The initial state */
  defaultState?: A.Doc<T>
}
