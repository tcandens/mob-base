import { useState, useEffect } from 'react'
import { socket } from '@/lib/sock'
import './App.css'

function App() {
  const roomId = 1

  const [users, setUsers] = useState([])
  useEffect(() => {
    socket.emit('join', {
      room: roomId
    })

    function handleRoomState(data) {
      console.log('recieving room state', data)
      setUsers(data.users)
    }

    function handleBeforeUnload() {
      socket.emit('leave', {
        room: roomId,
      })
    }

    window.addEventListener('beforeunload', handleBeforeUnload)

    socket.on('room_state:1', handleRoomState)
    return () => {
      socket.emit('leave', {room: roomId})
      socket.off('room_state:1', handleRoomState)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [])
  return (
    <>
      <div className="card">
        {JSON.stringify(users)}
      </div>
    </>
  )
}

export default App
