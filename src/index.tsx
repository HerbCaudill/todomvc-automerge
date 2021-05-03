import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Todos } from './Todos'
import { useTodos } from './useTodos'
import 'todomvc-app-css/index.css'

const App = () => {
  const props = useTodos()
  return (
    <div>
      <Todos {...props} />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
