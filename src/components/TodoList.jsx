import React from 'react'
import TodoCard from './TodoCard'

export default function TodoList(props) {
    const { todos, handleDoneTodo } = props; // Destructure handleDoneTodo from props
    
    return (
        <ul className='main'>
            {todos.map((todo, todoIndex) => {
                return (
                    <TodoCard {...props} key={todoIndex} index={todoIndex}>
                        <p>{todo}</p>
                        {/* "Done" button to mark the todo as done */}
                        <button onClick={() => handleDoneTodo(todoIndex)} className="done-button">
                            Done
                        </button>
                    </TodoCard>
                )
            })}
        </ul>
    )
}
