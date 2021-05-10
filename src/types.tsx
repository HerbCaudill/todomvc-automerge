import * as A from 'automerge'

export type TodoType = {
  value: string
  completed?: boolean
  id: string
}

export type State = {
  todos: A.List<TodoType>
}
