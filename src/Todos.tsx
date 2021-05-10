import React from 'react'
import 'todomvc-app-css/index.css'
import { Todo } from './Todo'
import { TodoType } from './types'
import { useSyncedState } from './useSyncedState'

const EMPTY = ''

export function Todos({}) {
  const todos = useSyncedState()
  const { peerIds, connected } = todos

  const peerCount = peerIds.length

  // new todo
  const [newTodo, setNewTodo] = React.useState(EMPTY)

  const onNewTodo = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    if (!newTodo.length) return
    todos.add(newTodo)
    setNewTodo(EMPTY) // clear input
  }

  // filter buttons
  const filters = ['All', 'Active', 'Completed']

  const [filter, setFilter] = React.useState('All')
  const show = (f: string) => () => setFilter(f)

  const key = filter.toLowerCase() as keyof TodosProps // = all | active | completed
  const visibleTodos = todos[key] as TodoType[] // = todos.all | todos.active | todos.completed

  // helper for highlighting the selected filter
  const highlightIf = (which: string) => (filter === which ? 'selected' : EMPTY)

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
            {visibleTodos.map(todo => {
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
          {/* item count */}
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
            children={'Clear completed'}
            onClick={() => {
              todos.clearCompleted()
              setFilter('All')
            }}
          />
        </footer>
      </section>
      <footer>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            lineHeight: 1,
          }}
        >
          <label
            style={{
              marginRight: '20px',
              padding: '9px 15px',
              border: '1px solid #ddd',
              borderRadius: '.5em',
            }}
            title={peerCount ? 'peers: ' + todos.peerIds.join(', ') : ''}
          >
            <span>
              {connected
                ? `🟢 online (${peerCount} peer${peerCount === 1 ? '' : 's'})`
                : '🔴 offline'}
            </span>
          </label>

          <a
            href="http://github.com/automerge/automerge"
            className="logo"
            title="Learn more about Automerge"
            target="_blank"
          >
            <img
              height="36"
              src="https://raw.githubusercontent.com/automerge/automerge/main/img/sign.svg"
              alt="Automerge"
            />
          </a>
        </div>
      </footer>
    </>
  )
}

export type TodosProps = ReturnType<typeof useSyncedState>
