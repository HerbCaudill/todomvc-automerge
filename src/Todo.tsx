import cn from 'classnames'
import React from 'react'
import { TodoType } from './types'
import { TodosProps } from './Todos'

export const Todo = ({ updateTodo, toggleTodo, deleteTodo, id, value, completed }: TodoProps) => {
  const [editing, setEditing] = React.useState(false)
  const [newValue, setNewValue] = React.useState(value)

  const inputRef = React.useRef<HTMLInputElement>(null)

  const onEdit = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newValue.length > 0) {
      setEditing(false)
      updateTodo({ id, value: newValue, completed })
    }
  }

  // select all when entering editing state
  React.useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  return (
    <li className={cn({ completed, editing })}>
      {/* viewing */}
      <div className="view">
        <input
          className="toggle"
          type="checkbox"
          checked={completed}
          onChange={() => toggleTodo({ id, value, completed })}
        />
        <label
          onDoubleClick={e => {
            e.preventDefault()
            setEditing(true)
          }}
        >
          {value}
        </label>
        <button className="destroy" onClick={() => deleteTodo(id)}></button>
      </div>

      {/* editing */}
      <input
        ref={inputRef}
        className="edit"
        onKeyPress={onEdit}
        onBlur={() => {
          setEditing(false)
          updateTodo({ id, value: newValue, completed })
        }}
        onChange={e => setNewValue(e.target.value)}
        defaultValue={newValue}
      />
    </li>
  )
}

export interface TodoProps
  extends Pick<TodosProps, 'updateTodo' | 'toggleTodo' | 'deleteTodo'>,
    TodoType {}
