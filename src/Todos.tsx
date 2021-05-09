import * as A from 'automerge'
import cn from 'classnames'
import React from 'react'
import 'todomvc-app-css/index.css'
import { Todo } from './Todo'
import { State, TodoType } from './types'
import { useTodos } from './useTodos'

export function Todos({}) {
  const { todos, add, toggle, update, toggleAll, clearCompleted, remove } = useTodos()

  // filters
  const filters = ['All', 'Active', 'Completed']

  const [filter, setFilter] = React.useState('All')
  const show = (f: string) => () => setFilter(f)

  const activeTodos = todos.filter(t => !t.completed)
  const completedTodos = todos.filter(t => t.completed)

  const displayedTodos = () => {
    switch (filter) {
      case 'All':
        return [...todos]
      case 'Active':
        return activeTodos
      case 'Completed':
        return completedTodos
      default:
        throw new Error()
    }
  }

  // new todo
  const [newTodo, setNewTodo] = React.useState('')

  const onNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.length > 0) {
      add(newTodo)
      setNewTodo('') // clear input
    }
  }

  const highlightIf = (which: string) => cn({ selected: filter === which })

  const itemCount = `${activeTodos.length}/${todos.length}`
  return (
    <>
      <section className="todoapp">
        <header className="header">
          <h1>todos</h1>

          {/* new todo input */}
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            autoFocus
            onKeyPress={onNewTodo}
            onChange={e => setNewTodo(e.target.value)}
            value={newTodo}
          />
        </header>

        <section className="main">
          {/* toggle all */}
          <input id="toggle-all" className="toggle-all" type="checkbox" onClick={toggleAll} />
          <label htmlFor="toggle-all">Mark all as complete</label>

          {/* todo list */}
          <ul className="todo-list">
            {displayedTodos().map(todo => {
              return <Todo key={todo.id} {...{ update, toggle, remove }} {...todo} />
            })}
          </ul>
        </section>

        <footer className="footer">
          {/* count */}
          <span className="todo-count">
            {`${itemCount} ${activeTodos.length > 1 ? 'items left' : 'item left'}`}
          </span>

          {/* filters */}
          <ul className="filters">
            {filters.map(f => (
              <li key={f}>
                <a className={highlightIf(f)} onClick={show(f)} children={f} />
              </li>
            ))}
          </ul>

          {/* clear completed button */}
          <button
            className="clear-completed"
            onClick={() => {
              clearCompleted()
              setFilter('All')
            }}
          >
            Clear completed
          </button>
        </footer>
      </section>
      <footer className="info">
        <p>
          Learn more about <a href="http://github.com/automerge/automerge">Automerge</a>
        </p>
      </footer>
    </>
  )
}

export interface TodosProps {
  state: A.Doc<State>
  add: (value: string) => void
  toggleAll: () => void
  toggle: (id: string) => void
  update: (modifiedTodo: TodoType) => void
  remove: (id: string) => void
  clearCompleted: () => void
}
