import * as React from 'react'
import * as ReactDOM from 'react-dom'
import { Todos } from './Todos'
import 'todomvc-app-css/index.css'

const App = () => {
  return (
    <div>
      <Todos />
    </div>
  )
}

ReactDOM.render(<App />, document.getElementById('root'))
