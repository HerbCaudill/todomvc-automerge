﻿import React from 'react'
import * as A from 'automerge'
import { uuid } from './uuid'
import { defaultState } from './defaultState'
import { State, TodoType } from './types'
import { TodosProps } from './Todos'
import { Synchronizer } from './Synchronizer'

const discoveryKey = 'frisky-meerkat'
const urls = ['ws://localhost:8080']
const userId = uuid().slice(32, 36)

export const useTodos: TodosHook = () => {
  const [state, setState] = React.useState(defaultState)
  const [synchronizer] = React.useState(
    () => new Synchronizer({ urls, userId, doc: state, discoveryKey })
  )

  // when we get changes from the ui, update our peers
  const change = (cb: A.ChangeFn<State>) => {
    const newState = synchronizer.change(cb)
    setState(newState)
    return newState
  }

  // when we get changes from peers, update the ui
  synchronizer.on('change', (newState: State) => {
    setState(newState)
  })

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

type TodosHook = () => TodosProps
