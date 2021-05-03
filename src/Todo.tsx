import cn from 'classnames'
import React from 'react'
import { TodoType } from './types'
import { TodosProps } from './Todos'

export const Todo = ({ updateTodo, toggleTodo, deleteTodo, id, value, completed }: TodoProps) => {
  const [editing, setEditing] = React.useState(false)
  const [newValue, setNewValue] = React.useState(value)

  // select all when entering editing state
  const inputRef = React.useRef<HTMLInputElement>(null)
  React.useEffect(() => {
    if (editing) inputRef.current?.select()
  }, [editing])

  const commitEdit = () => {
    setEditing(false)
    if (newValue.length) {
      // save the new value if it's non-empty
      updateTodo({ id, value: newValue, completed })
    } else {
      // clearing the text deletes the todo
      deleteTodo(id)
    }
  }

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
        // track the value as we type
        onChange={e => setNewValue(e.target.value)}
        // save the value when done
        onKeyPress={e => e.key === 'Enter' && commitEdit()}
        onBlur={commitEdit}
        defaultValue={newValue}
      />
    </li>
  )
}

export interface TodoProps
  extends Pick<TodosProps, 'updateTodo' | 'toggleTodo' | 'deleteTodo'>,
    TodoType {}
