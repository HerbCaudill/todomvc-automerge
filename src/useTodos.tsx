import React from 'react'
import * as A from 'automerge'
import { uuid } from './uuid'
import { defaultState } from './defaultState'
import { State, TodoType } from './types'
import { TodosProps } from './Todos'
import { Synchronizer } from './Synchronizer'

const discoveryKey = 'frisky-meerkat'
const urls = ['ws://localhost:8080']

export const useTodos: TodosHook = () => {
  const userName = React.useRef(uuid())
  const [state, setState] = React.useState(defaultState)
  const [synchronizer] = React.useState(
    () => new Synchronizer({ urls, userName: userName.current, doc: state, discoveryKey })
  )

  // change state and synchronize with peers
  const change = (cb: A.ChangeFn<State>) => {
    const newState = synchronizer.change(cb)
    setState(newState)
    return newState
  }

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
      // check or uncheck everything, depending on whether any are currently checked
      const allCompleted = state.todos.some(t => t.completed) ? false : true // if any are checked, uncheck all
      change(s => {
        s.todos.forEach(t => (t.completed = allCompleted))
      })
    },

    toggleTodo(id: string) {
      change(s => {
        // find the todo
        const todo = s.todos.find(t => t.id === id)
        // toggle it
        if (todo !== undefined) {
          todo.completed = !todo.completed
        }
      })
    },

    updateTodo(modifiedTodo: TodoType) {
      change(s => {
        // find the todo
        const todo = s.todos.find(t => t.id === modifiedTodo.id)
        // update it
        if (todo !== undefined) {
          todo.value = modifiedTodo.value
          todo.completed = modifiedTodo.completed
        }
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

type TodosHook = () => TodosProps
