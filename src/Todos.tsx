import * as A from 'automerge'
import cn from 'classnames'
import React from 'react'
import 'todomvc-app-css/index.css'
import { Todo } from './Todo'
import { State, TodoType } from './types'
import { useTodos } from './useTodos'

const EMPTY = ''

export function Todos({}) {
  const todos = useTodos()

  // new todo
  const [newTodo, setNewTodo] = React.useState(EMPTY)

  const onNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.length > 0) {
      todos.add(newTodo)
      setNewTodo(EMPTY) // clear input
    }
  }

  // filter buttons
  const filters = ['All', 'Active', 'Completed']

  const [filter, setFilter] = React.useState('All')
  const show = (f: string) => () => setFilter(f)

  const visibleTodos = () => {
    switch (filter) {
      case 'All':
        return todos.all
      case 'Active':
        return todos.active
      case 'Completed':
        return todos.completed
      default:
        throw new Error()
    }
  }

  const highlightIf = (which: string) => cn({ selected: filter === which })

  // item count

  const itemCount = `${todos.active.length}/${todos.all.length}`

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
          <input id="toggle-all" className="toggle-all" type="checkbox" onClick={todos.toggleAll} />
          <label htmlFor="toggle-all">Mark all as complete</label>

          {/* todo list */}
          <ul className="todo-list">
            {visibleTodos().map(todo => {
              return (
                <Todo
                  key={todo.id}
                  update={todos.update}
                  toggle={todos.toggle}
                  remove={todos.remove}
                  {...todo}
                />
              )
            })}
          </ul>
        </section>

        <footer className="footer">
          {/* count */}
          <span className="todo-count">
            {`${itemCount} ${todos.active.length > 1 ? 'items left' : 'item left'}`}
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
              todos.clearCompleted()
              setFilter('All')
            }}
          >
            Clear completed
          </button>
        </footer>
      </section>
      <footer className="info">
        <a
          href="http://github.com/automerge/automerge"
          className="logo"
          title="Learn more about Automerge"
          target="_blank"
        >
          <img
            src="https://raw.githubusercontent.com/automerge/automerge/main/img/sign.svg"
            alt="Automerge"
          />
        </a>
      </footer>
    </>
  )
}

export interface TodosProps {
  all: TodoType[]
  active: TodoType[]
  completed: TodoType[]
  add: (value: string) => void
  toggleAll: () => void
  toggle: (id: string) => void
  update: (modifiedTodo: TodoType) => void
  remove: (id: string) => void
  clearCompleted: () => void
}
