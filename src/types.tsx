import React from 'react'

export type TodoType = {
  value: string
  completed?: boolean
  id: string
}

export type TodosProps = {
  todos: TodoType[]
  addNewTodo: (value: string) => Promise<void>
  updateTodo: (modifiedTodo: TodoType) => Promise<void>
  deleteTodo?: (id: string) => Promise<void>
  clearCompletedTodos?: () => void
  todosTitle?: string
  children?: React.ReactNode
}
