import cn from 'classnames'
import React from 'react'
import 'todomvc-app-css/index.css'
import { TodoType } from './types'

export function Todos({
  todos,
  addNewTodo,
  toggleTodo,
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
  const clearNewTodo = () => setNewTodo('')

  const onNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newTodo.length > 0) {
      addNewTodo(newTodo).then(clearNewTodo)
    }
  }

  const showAll = () => setFilter('all')
  const showActive = () => setFilter('active')
  const showCompleted = () => setFilter('completed')

  const highlightIfSelected = (which: string) => cn({ selected: filter === which })

  return (
    <section className="todoapp">
      <header className="header">
        <h1>{todosTitle}</h1>
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
        <input id="toggle-all" className="toggle-all" type="checkbox" onClick={toggleAll} />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo.id} className={cn({ completed: todo.completed })}>
              <div className="view">
                <input
                  className="toggle"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => toggleTodo({ ...todo, completed: !todo.completed })}
                />
                <label>{todo.value}</label>
                <button className="destroy" onClick={() => deleteTodo(todo.id)}></button>
              </div>
              <input className="edit" defaultValue={todo.value} />
            </li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        {/* count */}
        <span className="todo-count">
          <strong>
            {todosMap.active.length}/{todos.length}
          </strong>{' '}
          item{todosMap.active.length > 1 && 's'} left
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

export type TodosProps = {
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
