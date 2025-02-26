import React, { useState } from 'react'
import './App.css'
import { Dexie } from 'dexie'
import { useLiveQuery } from 'dexie-react-hooks'

const db = new Dexie('todoApp')
db.version(1).stores({
  todos: '++id, task, completed, date',
  lists: '++id, name'
})

const { todos } = db

const App = () => {
  const allItems = useLiveQuery(() => todos.toArray(), [])
  const lists = useLiveQuery(() => db.lists.toArray(), []) || []
  const [latestTask, setLatestTask] = useState('')
  const [listName, setListName] = useState('')
  const [latestId, setLatestId] = useState('')

  const completedTasks = allItems?.filter(item => item.completed).length || 0
  const totalTasks = allItems?.length || 0

  const addNewList = async () => {
    if (listName.trim()) {
      await db.lists.add({
        name: listName,
        todos: []
      })
      setListName('')
    }
  }

  const addTask = async (event) => {
    event.preventDefault()
    const taskField = document.querySelector('#TaskInput')
    
    const id = await todos.add({
      task: taskField['value'],
      completed: false,
      date: new Date()
    })

    setLatestTask(taskField['value'])
    setLatestId(id.toString())
    
    taskField['value'] = ''
  }
  const deleteTask = async (id) => todos.delete(id)

  const toggleStatus = async (id, event) => {
    await todos.update(id, { completed: !!event.target.checked })
  }

  const TaskTracker = () => (
    <div className="task-tracker">
      <div className="progress-circle">
        {completedTasks}/{totalTasks}
      </div>
      <p>Way to go!</p>
      <p className="todo-message">
        {'ToDo task "' + (latestTask || 'task') + '" successfully added. Got id ' + (latestId || 'id')}
      </p>
    </div>
  )

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
  
      <div className="todo-layout">
        <div className="card white darken-1 todo-list">
          <div className="card-content">
            {allItems?.map(({ id, completed, task }) => (
              <div className="row" key={id}>
                <p className="col s10">
                  <label>
                    <input
                      type="checkbox"
                      defaultChecked={completed}
                      className="checkbox-blue"
                      onChange={event => toggleStatus(id, event)} 
                    />
                    <span className={`black-text ${completed && 'strike-text'}`}>{task}</span>
                  </label>
                </p>
                <i
                  onClick={() => deleteTask(id)}
                  className="col s2 material-icons delete-button"
                >
                  delete
                </i>
              </div>
            ))}
          </div>
        </div>
        <div className="tracker-section">
          <TaskTracker />
          <div className="new-list-section">
            <p>Give your list a name:</p>
            <input
              type="text"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
              placeholder="Name of list..."
              className="list-name-input"
            />
            <button onClick={addNewList} className="waves-effect btn teal add-list-btn">
              ≡ Add another list
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App