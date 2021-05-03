import React from 'react'
import { uuid } from './uuid'
import { defaultTodos } from './defaultTodos'
import { TodoType } from './types'

export function useTodos() {
  const [todos, setTodos] = React.useState<TodoType[]>(defaultTodos)

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

    clearCompletedTodos: () => {
      setTodos(todos.filter(t => !t.completed))
    },
  }
}
