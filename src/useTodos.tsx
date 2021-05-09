﻿import { defaultState } from './defaultState'
import { TodoType } from './types'
import { useAutomergeSync } from './useAutomergeSync'
import { uuid } from './uuid'

const key = 'frisky-meerkat'
const urls = ['ws://localhost:8080']
const userId = uuid().slice(32, 36)

export function useTodos() {
  const { state, change } = useAutomergeSync({ state: defaultState, urls, userId, key })
  return {
    state,

    addNewTodo(value: string) {
      change(s => {
        // make a new todo
        const newTodo = { value, id: uuid(), completed: false }
        // add it to the list
        s.todos.push(newTodo)
      })
    },

    toggleAll() {
      // if any are checked, uncheck all; otherwise check all
      const someChecked = state.todos.some(t => t.completed)
      const newCheckedState = someChecked ? false : true
      change(s => s.todos.forEach(t => (t.completed = newCheckedState)))
    },

    toggleTodo(id: string) {
      change(s => {
        // find the todo
        const todo = s.todos.find(t => t.id === id)
        if (!todo) return

        // toggle it
        todo.completed = !todo.completed
      })
    },

    updateTodo(modifiedTodo: TodoType) {
      change(s => {
        const { id, value, completed } = modifiedTodo

        // find the todo
        const todo = s.todos.find(t => t.id === id)
        if (!todo) return

        // update it
        todo.value = value
        todo.completed = completed
      })
    },

    deleteTodo(id: string) {
      change(s => {
        const i = s.todos.findIndex(t => t.id === id)
        s.todos.deleteAt!(i)
      })
    },

    clearCompletedTodos: () => {
      change(s => {
        let i = 0
        let length = s.todos.length
        while (i < length) {
          if (s.todos[i].completed) {
            s.todos.deleteAt!(i)
            length -= 1
          } else {
            i += 1
          }
        }
      })
    },
  }
}
