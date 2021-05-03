import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Todos } from './Todos'
import { useTodosLocalStorageState } from './useTodosLocalStorageState'
import 'todomvc-app-css/index.css'

const App = () => {
  const props = useTodosLocalStorageState()
  return (
    <div>
      <Todos {...props} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
