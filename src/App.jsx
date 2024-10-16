import { useState, useEffect } from "react";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import './App.css'; // Importing styles

function App() {
  const [todos, setTodos] = useState([]);
  const [futureTodos, setFutureTodos] = useState([]); // Future to-dos
  const [todoValue, setTodoValue] = useState('');
  const [currentTodo, setCurrentTodo] = useState('');
  const [currentTodoIndex, setCurrentTodoIndex] = useState(null); // Track index of current random to-do
  const [view, setView] = useState('random'); // Default view is random
  const [isDarkMode, setIsDarkMode] = useState(false); // Light or Dark mode
  const [timeLeft, setTimeLeft] = useState(1500); // Pomodoro timer (25 min)
  const [isTimerRunning, setIsTimerRunning] = useState(false); // Track if timer is running

  function persistData(newList, futureList) {
    localStorage.setItem('todos', JSON.stringify({ todos: newList, futureTodos: futureList }));
  }

  function handleAddTodos(newTodo) {
    const newTodoList = [...todos, newTodo];
    persistData(newTodoList, futureTodos);
    setTodos(newTodoList);
  }

  function handleDeleteTodo(index) {
    const newTodoList = todos.filter((todo, todoIndex) => {
      return todoIndex !== index;
    });
    persistData(newTodoList, futureTodos);
    setTodos(newTodoList);
    if (newTodoList.length > 0) {
      getRandomTodo(newTodoList);
    } else {
      setCurrentTodo('');
    }
  }

  // Mark a todo as "done" and move to future todos list
  function handleDoneTodo(index) {
    const todoToMove = todos[index];
    const newFutureTodos = [...futureTodos, { todo: todoToMove, doneDate: new Date() }];
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

  // Move back any todos that were done over 2 days ago
  function moveFutureTodosBack() {
    const twoDaysInMillis = 2 * 24 * 60 * 60 * 1000;
    const now = new Date();

    const readyTodos = futureTodos.filter((item) => now - new Date(item.doneDate) > twoDaysInMillis);
    const remainingFutureTodos = futureTodos.filter((item) => now - new Date(item.doneDate) <= twoDaysInMillis);

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

    // Pomodoro timer logic
    const timer = setInterval(() => {
      if (isTimerRunning && timeLeft > 0) {
        setTimeLeft((prevTime) => prevTime - 1);
      }
    }, 1000);

    // Check future todos every time the app loads
    moveFutureTodosBack();

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
            handleDoneTodo={handleDoneTodo} // Add the done button to each todo
          />
        )}
      </div>

      {/* Random To-Do View (Default Mode) */}
      {view === 'random' && (
        <div className="random-todo-container slide-in">
          <div className="todo-card">
            {currentTodo ? <p>{currentTodo}</p> : <p>unBusy</p>}
          </div>
          <button onClick={() => handleDoneTodo(currentTodoIndex)} className="done-button">
            Done
          </button>
          <button onClick={() => getRandomTodo(todos)} className="random-button">
            Show Another To-Do
          </button>
        </div>
      )}

      {/* Pomodoro Timer */}
      {/* <div className="pomodoro-timer">
        <h3>Pomodoro Timer</h3>
        <p>{formatTime(timeLeft)}</p>
        <div className="timer-controls">
          <button onClick={startTimer} className="timer-button">Start</button>
          <button onClick={pauseTimer} className="timer-button">Pause</button>
          <button onClick={resetTimer} className="timer-button">Reset</button>
        </div>
      </div> */}
    </div>
  );
}

export default App;
