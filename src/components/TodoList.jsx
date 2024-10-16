import React from 'react'
import TodoCard from './TodoCard'

export default function TodoList(props) {
  const { todos, handleDoneTodo, setReturnTime } = props;

  return (
    <ul className='main'>
      {todos.map((todo, todoIndex) => {
        return (
          <TodoCard {...props} key={todoIndex} index={todoIndex}>
            <p>{todo}</p>
            {/* Input for setting custom return time */}
            <div>
              <label>Return in: </label>
              <input
                type="number"
                onChange={(e) => setReturnTime(e.target.value)}
                min="1"
                placeholder="Days"
              /> days
            </div>
            {/* Done Button */}
            <button onClick={() => handleDoneTodo(todoIndex)} className="done-button">
              Done
            </button>
          </TodoCard>
        )
      })}
    </ul>
  )
}
