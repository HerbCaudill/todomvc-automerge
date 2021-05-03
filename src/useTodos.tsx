import React from 'react'
import { uuid } from './uuid'
import { defaultTodos } from './defaultTodos'
import { TodoType } from './types'
import { TodosProps } from './Todos'

export function useTodos() {
  const [todos, setTodos] = React.useState<TodoType[]>(defaultTodos)

  return {
    todos,

    async addNewTodo(value: string) {
      setTodos([...todos, { value, id: uuid(), completed: false }])
    },

    async toggleAll() {
      const toggleResult = todos.filter(t => t.completed).length > 0 ? false : true
      setTodos(todos.map(todo => ({ ...todo, completed: toggleResult })))
    },

    async toggleTodo(modifiedTodo: TodoType) {
      setTodos(
        todos.map(todo =>
          todo.id !== modifiedTodo.id ? todo : { ...todo, completed: !todo.completed }
        )
      )
    },

    async updateTodo(modifiedTodo: TodoType) {
      setTodos(
        todos.map(todo => (todo.id !== modifiedTodo.id ? todo : { ...todo, ...modifiedTodo }))
      )
    },

    async deleteTodo(id: string) {
      setTodos(todos.filter(todo => todo.id !== id))
    },

    clearCompletedTodos: () => {
      setTodos(todos.filter(t => !t.completed))
    },
  } as TodosProps
}
