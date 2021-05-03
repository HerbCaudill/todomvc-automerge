import React from 'react'
import { uuid } from './uuid'
import { defaultTodos } from './defaultTodos'
import { TodoType } from './types'

export function useTodosLocalStorageState() {
  let _pastState = localStorage.getItem('TODO')
  let pastState = _pastState
    ? JSON.parse(_pastState) || defaultTodos
    : defaultTodos
  const [todos, setTodos] = React.useState<TodoType[]>(pastState)
  React.useEffect(() => {
    localStorage.setItem('TODO', JSON.stringify(todos))
  })
  // external API + implementation
  return {
    todos,
    async addNewTodo(value: string) {
      setTodos([...todos, { value, id: uuid(), completed: false }])
    },
    async updateTodo(modifiedTodo: TodoType) {
      setTodos(
        todos.map(todo =>
          todo.id !== modifiedTodo.id
            ? todo
            : { ...todo, completed: !todo.completed }
        )
      )
    },
    async deleteTodo(id: string) {
      setTodos(todos.filter(todo => todo.id !== id))
    },
    clearCompletedTodos: () => {
      window.confirm('Sure you want to clear completed todos?') &&
        setTodos(todos.filter(t => !t.completed))
    },
  }
}
