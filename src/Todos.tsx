import cn from 'classnames'
import React from 'react'
import 'todomvc-app-css/index.css'
import { TodosProps, TodoType } from './types'

export function Todos({
  todos,
  addNewTodo,
  updateTodo,
  clearCompletedTodos,
  deleteTodo,
  todosTitle = 'todos',
}: TodosProps) {
  const [filter, setFilter] = React.useState('all')
  const todosMap = {
    active: todos.filter(t => !t.completed),
    completed: todos.filter(t => t.completed),
  } as Record<string, TodoType[]>

  // newtodo
  const [newTodo, setNewTodo] = React.useState('')
  const onNewTodo_enter = (e: React.KeyboardEvent<HTMLInputElement>) =>
    e.key === 'Enter' &&
    newTodo.length > 0 &&
    addNewTodo(newTodo).then(() => setNewTodo(''))
  const filteredTodos = todosMap[filter] || todos

  return (
    <section className="todoapp">
      <header className="header">
        <h1>{todosTitle}</h1>
        <input
          className="new-todo"
          placeholder="What needs to be done?"
          autoFocus
          onKeyPress={onNewTodo_enter}
          onChange={e => setNewTodo(e.target.value)}
          value={newTodo}
        />
      </header>
      <section className="main">
        <input id="toggle-all" className="toggle-all" type="checkbox" />
        <label htmlFor="toggle-all">Mark all as complete</label>
        <ul className="todo-list">
          {filteredTodos.map(todo => (
            <li key={todo.id} className={cn(todo.completed && 'completed')}>
              <div className="view">
                <input
                  className="toggle"
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() =>
                    updateTodo({ ...todo, completed: !todo.completed })
                  }
                />
                <label>{todo.value}</label>
                {deleteTodo && (
                  <button
                    className="destroy"
                    onClick={() => deleteTodo(todo.id)}
                  ></button>
                )}
              </div>
              <input className="edit" defaultValue={todo.value} />
            </li>
          ))}
        </ul>
      </section>
      <footer className="footer">
        <span className="todo-count">
          <strong>
            {todosMap.active.length}/{todos.length}
          </strong>{' '}
          item{todosMap.active.length > 1 && 's'} left
        </span>
        <ul className="filters">
          <li>
            <a
              className={cn(filter === 'all' && 'selected')}
              onClick={() => setFilter('all')}
            >
              All
            </a>
          </li>
          <li>
            <a
              className={cn(filter === 'active' && 'selected')}
              onClick={() => setFilter('active')}
            >
              Active
            </a>
          </li>
          <li>
            <a
              className={cn(filter === 'completed' && 'selected')}
              onClick={() => setFilter('completed')}
            >
              Completed
            </a>
          </li>
        </ul>
        {clearCompletedTodos && (
          <button
            className="clear-completed"
            onClick={() => {
              clearCompletedTodos()
              setFilter('all')
            }}
          >
            Clear completed
          </button>
        )}
      </footer>
    </section>
  )
}
