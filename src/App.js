import React from 'react'
import './App.css'
import { Dexie } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

const db = new Dexie('todoApp')
db.version(1).stores({
  todos: '++id, task,completed, date'
})

const { todos } = db

const App = () => {
  const allItems = useLiveQuery(() => todos.toArray(), [])

  const addTask = async (event) => {
    event.preventDefault()
    const taskField = document.querySelector('#TaskInput')
    
    await todos.add({
      task: taskField['value'],
      completed: false
    })

    taskField['value'] = ''
  }

  return (
    <div className="container">
      <h3 className="teal-text center-align">Todo App</h3>
      <form className="add-item-form" onSubmit={addTask}>
        <input
          type="text"
          id="TaskInput"
          className="itemField"
          placeholder="What do you want to do today?"
          required
        />
        <button type="submit" className="waves-effect btn teal right">
          Add
        </button>
      </form>

      <div className="card white darken-1">
        <div className="card-content">
          <div className="row">
            <p className="col s10">
              <label>
                <input type="checkbox" checked className="checkbox-blue" />
                <span className="black-tex strike-text">Call John Legend</span>
              </label>
            </p>
            <i className="col s2 material-icons delete-button">delete</i>
          </div>

          <div className="row">
            <p className="col s10">
              <label>
                <input type="checkbox" className="checkbox-blue" />
                <span className="black-tex">Do my laundry</span>
              </label>
            </p>
            <i className="col s2 material-icons delete-button">delete</i>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
