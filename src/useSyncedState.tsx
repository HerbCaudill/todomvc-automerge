import * as A from 'automerge'
import { State, TodoType } from './types'
import { makeRandom } from '@herbcaudill/random'
import { useAutomergeSync } from './useAutomergeSync'
import { uuid } from './uuid'

// The user ID needs to be unique among all peers. If users might have multiple devices, then the
// user ID should be specific to the device as well as the user. For this example we'll use a random
// 3-letter userId.
const random = makeRandom()
const userId = random.alpha(3)

// The discovery key (or document ID) uniquely identifies this Automerge document (in this case, our
// todo list). Anyone who knows the discovery key can connect with anyone else who knows it. In real
// use this might be a UUID.
const key = 'frisky-meerkat'

// We need to provide the URL for at least one relay server. See
// https://github.com/local-first-web/relay#readme for details.
const urls = ['ws://localhost:8080']
// Note: Multiple relay servers aren't supported yet, so we just use the first one.

// This will be our application state when we load (or reload) the app.
const defaultState = A.from<State>({
  todos: [
    { id: '0', completed: true, value: 'Learn React' },
    { id: '1', completed: false, value: 'Learn Automerge' },
    { id: '2', completed: false, value: 'Profit' },
  ],
})

export function useSyncedState() {
  const { state, change, connected, peerIds } = useAutomergeSync<State>({
    defaultState,
    urls,
    userId,
    key,
  })

  return {
    // connection status

    connected,
    peerIds,

    // "selectors"

    all: state.todos,
    active: state.todos.filter(t => !t.completed),
    completed: state.todos.filter(t => t.completed),

    // "reducers"

    add(value: string) {
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

    toggle(id: string) {
      change(s => {
        // find the todo
        const todo = s.todos.find(t => t.id === id)
        if (!todo) return

        // toggle it
        todo.completed = !todo.completed
      })
    },

    update(modifiedTodo: TodoType) {
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

    remove(id: string) {
      change(s => {
        const i = s.todos.findIndex(t => t.id === id)
        s.todos.deleteAt!(i)
      })
    },

    clearCompleted: () => {
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
