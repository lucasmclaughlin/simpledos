import { useState, useEffect } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEdit, faClock, faTrashAlt, faNoteSticky } from '@fortawesome/free-solid-svg-icons'; // Import icons
import './App.css'; // Importing styles

function App() {
  const [todos, setTodos] = useState([]);
  const [futureTodos, setFutureTodos] = useState([]); // Future to-dos
  const [todoValue, setTodoValue] = useState('');
  const [currentTodo, setCurrentTodo] = useState('');
  const [currentTodoIndex, setCurrentTodoIndex] = useState(null); // Track index of current random to-do
  const [view, setView] = useState('random'); // Default view is random
  const [isDarkMode, setIsDarkMode] = useState(false); // Light or Dark mode
  const [returnTime, setReturnTime] = useState(2); // Default return time (2 days)

  function persistData(newList, futureList) {
    localStorage.setItem('todos', JSON.stringify({ todos: newList, futureTodos: futureList }));
  }

  function handleAddTodos(newTodo) {
    const newTodoList = [...todos, newTodo];
    persistData(newTodoList, futureTodos);
    setTodos(newTodoList);
  }

  function handleDeleteTodo(index) {
    const newTodoList = todos.filter((todo, todoIndex) => todoIndex !== index);
    persistData(newTodoList, futureTodos);
    setTodos(newTodoList);
    if (newTodoList.length > 0) {
      getRandomTodo(newTodoList);
    } else {
      setCurrentTodo('');
    }
  }

  // Mark a todo as "done" and move to future todos list with custom return time
  function handleDoneTodo(index, customReturnTime) {
    const todoToMove = todos[index];
    const newFutureTodos = [...futureTodos, { 
      todo: todoToMove, 
      doneDate: new Date(), 
      returnInDays: customReturnTime || returnTime // Use custom return time or default
    }];
    const newTodoList = todos.filter((_, todoIndex) => todoIndex !== index);
    persistData(newTodoList, newFutureTodos);
    setTodos(newTodoList);
    setFutureTodos(newFutureTodos);

    // After marking the current todo as done, get a new random todo
    if (newTodoList.length > 0) {
      getRandomTodo(newTodoList);
    } else {
      setCurrentTodo('');
    }
  }

  // Handle deleting a future to-do
  function handleDeleteFutureTodo(index) {
    const newFutureTodos = futureTodos.filter((_, todoIndex) => todoIndex !== index);
    setFutureTodos(newFutureTodos);
    persistData(todos, newFutureTodos); // Persist the change to localStorage
  }

  // Move back any todos that are ready based on custom return time
  function moveFutureTodosBack() {
    const now = new Date();

    const readyTodos = futureTodos.filter((item) => {
      const returnTimeInMillis = item.returnInDays * 24 * 60 * 60 * 1000;
      return now - new Date(item.doneDate) > returnTimeInMillis;
    });

    const remainingFutureTodos = futureTodos.filter((item) => {
      const returnTimeInMillis = item.returnInDays * 24 * 60 * 60 * 1000;
      return now - new Date(item.doneDate) <= returnTimeInMillis;
    });

    if (readyTodos.length > 0) {
      const newTodoList = [...todos, ...readyTodos.map((item) => item.todo)];
      setTodos(newTodoList);
      setFutureTodos(remainingFutureTodos);
      persistData(newTodoList, remainingFutureTodos);
    }
  }

  function handleEditTodo(index) {
    const valueToBeEdited = todos[index];
    setTodoValue(valueToBeEdited);
    handleDeleteTodo(index);
  }

  // Modified to track the index of the selected random todo
  function getRandomTodo(todoList) {
    if (todoList.length > 0) {
      const randomIndex = Math.floor(Math.random() * todoList.length);
      setCurrentTodo(todoList[randomIndex]);
      setCurrentTodoIndex(randomIndex);
    } else {
      setCurrentTodo('');
      setCurrentTodoIndex(null);
    }
  }

  useEffect(() => {
    // Check time of day for light or dark mode
    const hour = new Date().getHours();
    setIsDarkMode(hour > 18 || hour < 6); // Dark mode after 6pm or before 6am

    let storedTodos = localStorage.getItem('todos');
    if (storedTodos) {
      const parsed = JSON.parse(storedTodos);
      setTodos(parsed.todos);
      setFutureTodos(parsed.futureTodos || []);
      getRandomTodo(parsed.todos);
    }

    // Check future todos every time the app loads
    moveFutureTodosBack();
  }, []);

  // Toggle between views with a sliding animation
  const toggleView = (newView) => {
    setView(newView);
  };

  return (
    <div className={`app-container ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Header with add new to-do */}
      <div className="header">
        <TodoInput
          todoValue={todoValue}
          setTodoValue={setTodoValue}
          handleAddTodos={handleAddTodos}
        />
        <button className="view-toggle-icon" onClick={() => toggleView('list')}>
          <FontAwesomeIcon icon={faEdit} /> {/* Edit/View All Todos */}
        </button>
        <button className="view-toggle-icon" onClick={() => toggleView('random')}>
          <FontAwesomeIcon icon={faNoteSticky} /> {/* Random Todos */}
        </button>
        <button className="view-toggle-icon" onClick={() => toggleView('future')}>
          <FontAwesomeIcon icon={faClock} /> {/* Future Todos */}
        </button>
        
      </div>

      {/* To-Do List View (Edit Mode) */}
      <div className={`content-container ${view === 'list' ? 'slide-in' : 'slide-out'}`}>
        {view === 'list' && (
          <TodoList
            handleEditTodo={handleEditTodo}
            handleDeleteTodo={handleDeleteTodo}
            todos={todos}
            handleDoneTodo={handleDoneTodo}
            setReturnTime={setReturnTime} // Pass the return time setter
          />
        )}
      </div>

      {/* Random To-Do View (Default Mode) */}
      {view === 'random' && (
        <div className="random-todo-container slide-in">
          <div className="todo-card">
            {currentTodo ? <p>{currentTodo}</p> : <p>unBusy</p>}
          </div>
          <button onClick={() => handleDoneTodo(currentTodoIndex, returnTime)} className="done-button">
            Done
          </button>
          <button onClick={() => getRandomTodo(todos)} className="random-button">
            Show Another To-Do
          </button>
        </div>
      )}

      {/* Future To-Do View */}
      {view === 'future' && (
        <div className="future-todo-container slide-in">
          <h3>Future To-Dos</h3>
          <ul>
            {futureTodos.length > 0 ? (
              futureTodos.map((item, index) => (
                <li key={index}>
                  <p>{item.todo}</p>
                  <small>(Return in {item.returnInDays} days)</small>
                  {/* Delete Button for Future To-Dos */}
                  <button onClick={() => handleDeleteFutureTodo(index)} className="delete-button">
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete
                  </button>
                </li>
              ))
            ) : (
              <p>No future to-dos available.</p>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}

export default App;
