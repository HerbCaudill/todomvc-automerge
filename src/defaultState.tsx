import * as A from 'automerge'
import { State } from './types'

export const defaultState: A.Doc<State> = A.from({
  todos: [
    {
      id: '0',
      completed: true,
      value: 'Learn React',
    },
    {
      id: '1',
      completed: false,
      value: 'Learn Automerge',
    },
    {
      id: '2',
      completed: false,
      value: 'Profit',
    },
  ],
})
