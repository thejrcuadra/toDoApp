import React, { useState } from 'react';
import './App.css';
import { Dexie } from 'dexie';
import { useLiveQuery } from 'dexie-react-hooks';

const db = new Dexie('todoApp');
db.version(1).stores({
  todos: '++id, task, completed, date, listId', // Updated schema
  lists: '++id, name'
});

const { todos } = db;

const App = () => {
  const allItems = useLiveQuery(() => todos.toArray(), []);
  const lists = useLiveQuery(() => db.lists.toArray(), []) || [];
  const [latestTask, setLatestTask] = useState('');
  const [listName, setListName] = useState('');
  const [latestId, setLatestId] = useState('');

  const completedTasks = allItems?.filter(item => item.completed).length || 0;
  const totalTasks = allItems?.length || 0;

  const addNewList = async (event) => {
    if (event) event.preventDefault();
    if (listName.trim()) {
      await db.lists.add({
        name: listName
      });
      setListName('');
    }
  };

  const deleteList = async (id) => {
    await db.lists.delete(id);
    // Optionally, delete associated tasks
    await todos.where('listId').equals(id).delete();
  };

  const addTask = async (event) => {
    event.preventDefault();
    const taskField = document.querySelector('#TaskInput');
    const id = await todos.add({
      task: taskField['value'],
      completed: false,
      date: new Date()
      // listId is not set, so it’s undefined, going to the default list
    });
    setLatestTask(taskField['value']);
    setLatestId(id.toString());
    taskField['value'] = '';
  };

  const deleteTask = async (id) => todos.delete(id);

  const toggleStatus = async (id, event) => {
    await todos.update(id, { completed: !!event.target.checked });
  };

  const TaskTracker = () => (
    <div className="task-tracker" style={{ textAlign: 'center' }}>
      <div className="progress-circle">
        {completedTasks}/{totalTasks}
      </div>
      <p>Way to go!</p>
      <p className="todo-message">
        {'ToDo task "' + (latestTask || 'task') + '" successfully added. Got id ' + (latestId || 'id')}
      </p>
    </div>
  );

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
            {/* Show only tasks not associated with any list */}
            {allItems?.filter(todo => !todo.listId).map(({ id, completed, task }) => (
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
          <div style={{ display: 'flex', justifyContent: 'center' }}>
            <TaskTracker />
          </div>
        </div>
        <div className="tracker-section">
          <div className="new-list-section">
            <p>Give your list a name:</p>
            <form onSubmit={addNewList}>
              <input
                type="text"
                value={listName}
                onChange={(e) => setListName(e.target.value)}
                placeholder="Name of list..."
                className="list-name-input"
              />
            </form>
            <button onClick={addNewList} className="waves-effect btn teal add-list-btn">
              ≡ Add another list
            </button>
            {lists.length > 0 && (
              <div className="existing-lists">
                <p>Existing lists:</p>
                <ul>
                  {lists.map(list => (
                    <li key={list.id} className="row">
                      <span className="col s10">{list.name}</span>
                      <i
                        onClick={() => deleteList(list.id)}
                        className="col s2 material-icons delete-button"
                      >
                        delete
                      </i>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          {/* New to-do list instances */}
          <div className="todo-instances">
            {lists.map(list => (
              <div key={list.id} className="todo-instance card white darken-1">
                <div className="card-content">
                  <div className="todo-instance-header row">
                    <h5 className="col s10 black-text">
                      {list.name} {new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: '2-digit' })}
                    </h5>
                    <i
                      onClick={() => deleteList(list.id)}
                      className="col s2 material-icons delete-button"
                    >
                      delete
                    </i>
                  </div>
                  {allItems?.filter(todo => todo.listId === list.id).map(todo => (
                    <div key={todo.id} className="row">
                      <p className="col s10">
                        <label>
                          <input
                            type="checkbox"
                            defaultChecked={todo.completed}
                            className="checkbox-blue"
                            onChange={event => toggleStatus(todo.id, event)}
                          />
                          <span className={`black-text ${todo.completed && 'strike-text'}`}>{todo.task}</span>
                        </label>
                      </p>
                      <i
                        onClick={() => deleteTask(todo.id)}
                        className="col s2 material-icons delete-button"
                      >
                        delete
                      </i>
                    </div>
                  ))}
                  <form
                    onSubmit={async (event) => {
                      event.preventDefault();
                      const taskField = event.target.querySelector('input');
                      if (taskField.value.trim()) {
                        await todos.add({
                          task: taskField.value,
                          completed: false,
                          date: new Date(),
                          listId: list.id
                        });
                        taskField.value = '';
                      }
                    }}
                    className="add-task-form"
                  >
                    <input
                      type="text"
                      placeholder="Add todo item..."
                      className="itemField"
                      required
                    />
                  </form>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;