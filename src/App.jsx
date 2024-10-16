import { useState, useEffect } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import './App.css'; // Importing styles

function App() {
  const [todos, setTodos] = useState([]);
  const [todoValue, setTodoValue] = useState('');
  const [currentTodo, setCurrentTodo] = useState('');
  const [view, setView] = useState('random'); // Default view is random
  const [isDarkMode, setIsDarkMode] = useState(false); // Light or Dark mode
  const [timeLeft, setTimeLeft] = useState(1500); // Pomodoro timer (25 min)
  const [isTimerRunning, setIsTimerRunning] = useState(false); // Track if timer is running

  function persistData(newList) {
    localStorage.setItem('todos', JSON.stringify({ todos: newList }));
  }

  function handleAddTodos(newTodo) {
    const newTodoList = [...todos, newTodo];
    persistData(newTodoList);
    setTodos(newTodoList);
  }

  function handleDeleteTodo(index) {
    const newTodoList = todos.filter((todo, todoIndex) => {
      return todoIndex !== index;
    });
    persistData(newTodoList);
    setTodos(newTodoList);
    if (newTodoList.length > 0) {
      getRandomTodo(newTodoList);
    } else {
      setCurrentTodo('');
    }
  }

  function handleEditTodo(index) {
    const valueToBeEdited = todos[index];
    setTodoValue(valueToBeEdited);
    handleDeleteTodo(index);
  }

  function getRandomTodo(todoList) {
    if (todoList.length > 0) {
      const randomIndex = Math.floor(Math.random() * todoList.length);
      setCurrentTodo(todoList[randomIndex]);
    } else {
      setCurrentTodo('');
    }
  }

  useEffect(() => {
    // Check time of day for light or dark mode
    const hour = new Date().getHours();
    setIsDarkMode(hour > 18 || hour < 6); // Dark mode after 6pm or before 6am

    let localTodos = localStorage.getItem('todos');
    if (localTodos) {
      localTodos = JSON.parse(localTodos).todos;
      setTodos(localTodos);
      getRandomTodo(localTodos);
    }

    // Pomodoro timer logic
    const timer = setInterval(() => {
      if (isTimerRunning && timeLeft > 0) {
        setTimeLeft((prevTime) => prevTime - 1);
      }
    }, 1000);

    return () => clearInterval(timer); // Cleanup the interval on component unmount
  }, [isTimerRunning, timeLeft]);

  // Convert seconds to mm:ss for timer display
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
  };

  // Start, Pause, and Reset functionality
  const startTimer = () => setIsTimerRunning(true);
  const pauseTimer = () => setIsTimerRunning(false);
  const resetTimer = () => {
    setIsTimerRunning(false);
    setTimeLeft(1500); // Reset to 25 minutes
  };

  // Toggle between views with a sliding animation
  const toggleView = () => {
    setView((prevView) => (prevView === 'random' ? 'list' : 'random'));
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
        <span className="view-toggle-icon" onClick={toggleView}>
          {view === 'random' ? '✏️' : '🔄'}
        </span>
      </div>

      {/* To-Do List View (Edit Mode) */}
      <div className={`content-container ${view === 'list' ? 'slide-in' : 'slide-out'}`}>
        {view === 'list' && (
          <TodoList
            handleEditTodo={handleEditTodo}
            handleDeleteTodo={handleDeleteTodo}
            todos={todos}
          />
        )}
      </div>

      {/* Random To-Do View (Default Mode) */}
      {view === 'random' && (
        <div className="random-todo-container slide-in">
          <div className="todo-card">
            {currentTodo ? <p>{currentTodo}</p> : <p>No to-dos available</p>}
          </div>
          <button onClick={() => getRandomTodo(todos)} className="random-button">
            Show Another To-Do
          </button>
        </div>
      )}

      {/* Pomodoro Timer */}
      <div className="pomodoro-timer">
        <h3>Pomodoro Timer</h3>
        <p>{formatTime(timeLeft)}</p>
        <div className="timer-controls">
          <button onClick={startTimer} className="timer-button">Start</button>
          <button onClick={pauseTimer} className="timer-button">Pause</button>
          <button onClick={resetTimer} className="timer-button">Reset</button>
        </div>
      </div>
    </div>
  );
}

export default App;
