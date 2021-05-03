import cn from 'classnames'
import React from 'react'
import 'todomvc-app-css/index.css'
import { Todo } from './Todo'
import { TodoType } from './types'

export function Todos({
  todos,
  addNewTodo,
  toggleTodo,
  updateTodo,
  toggleAll,
  clearCompletedTodos,
  deleteTodo,
  todosTitle = 'todos',
}: TodosProps) {
  // filters

  const [filter, setFilter] = React.useState('all')
  const todosMap = {
    all: todos,
    active: todos.filter(t => !t.completed),
    completed: todos.filter(t => t.completed),
  } as Record<string, TodoType[]>

  const filteredTodos = todosMap[filter]

  // new todo
  const [newTodo, setNewTodo] = React.useState('')

  const onNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.length > 0) {
      addNewTodo(newTodo)
      setNewTodo('') // clear input
    }
  }

  const showAll = () => setFilter('all')
  const showActive = () => setFilter('active')
  const showCompleted = () => setFilter('completed')

  const highlightIfSelected = (which: string) => cn({ selected: filter === which })

  const itemCount = `${todosMap.active.length}/${todos.length}`

  return (
    <section className="todoapp">
      <header className="header">
        <h1>{todosTitle}</h1>

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
          {filteredTodos.map(todo => {
            return <Todo key={todo.id} {...{ updateTodo, toggleTodo, deleteTodo }} {...todo} />
          })}
        </ul>
      </section>

      <footer className="footer">
        {/* count */}
        <span className="todo-count">
          {`${itemCount} ${todosMap.active.length > 1 ? 'items left' : 'item left'}`}
        </span>

        {/* filters */}
        <ul className="filters">
          <li>
            <a className={highlightIfSelected('all')} onClick={showAll}>
              All
            </a>
          </li>
          <li>
            <a className={highlightIfSelected('active')} onClick={showActive}>
              Active
            </a>
          </li>
          <li>
            <a className={highlightIfSelected('completed')} onClick={showCompleted}>
              Completed
            </a>
          </li>
        </ul>

        {/* clear completed button */}
        <button
          className="clear-completed"
          onClick={() => {
            clearCompletedTodos()
            showAll()
          }}
        >
          Clear completed
        </button>
      </footer>
    </section>
  )
}

export interface TodosProps {
  todos: TodoType[]
  addNewTodo: (value: string) => Promise<void>
  toggleAll: () => Promise<void>
  toggleTodo: (modifiedTodo: TodoType) => Promise<void>
  updateTodo: (modifiedTodo: TodoType) => Promise<void>
  deleteTodo: (id: string) => Promise<void>
  clearCompletedTodos: () => void
  todosTitle?: string
  children?: React.ReactNode
}
