import React from 'react'
import * as A from 'automerge'
import { uuid } from './uuid'
import { defaultState } from './defaultState'
import { State, TodoType } from './types'
import { TodosProps } from './Todos'

export const useTodos: TodosHook = () => {
  const [state, setState] = React.useState(defaultState)

  // compose `setState` and `A.change`
  const change = (s: A.Doc<State>, cb: A.ChangeFn<State>) => setState(A.change(s, cb))

  return {
    state,

    addNewTodo(value: string) {
      change(state, state => {
        // make a new todo
        const newTodo = { value, id: uuid(), completed: false }
        // add it to the list
        state.todos.push(newTodo)
      })
    },

    toggleAll() {
      // check or uncheck everything, depending on whether any are currently checked
      const allCompleted = state.todos.some(t => t.completed) ? false : true // if any are checked, uncheck all
      change(state, state => {
        state.todos.forEach(t => (t.completed = allCompleted))
      })
    },

    toggleTodo(id: string) {
      change(state, state => {
        // find the todo
        const todo = state.todos.find(t => t.id === id)
        // toggle it
        if (todo !== undefined) {
          todo.completed = !todo.completed
        }
      })
    },

    updateTodo(modifiedTodo: TodoType) {
      change(state, state => {
        // find the todo
        const todo = state.todos.find(t => t.id === modifiedTodo.id)
        // update it
        if (todo !== undefined) {
          todo.value = modifiedTodo.value
          todo.completed = modifiedTodo.completed
        }
      })
    },

    deleteTodo(id: string) {
      change(state, state => {
        const i = state.todos.findIndex(t => t.id === id)
        state.todos.deleteAt(i)
      })
    },

    clearCompletedTodos: () => {
      change(state, state => {
        let i = 0
        let length = state.todos.length
        while (i < length) {
          if (state.todos[i].completed) {
            state.todos.deleteAt(i)
            length -= 1
          } else {
            i += 1
          }
        }
      })
    },
  }
}

type TodosHook = () => TodosProps
