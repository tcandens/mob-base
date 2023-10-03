import { useState } from 'react'
import './App.css'
import { socket, useSocket, restartSocket } from '@/lib/socket'

function App() {
  const [users, setUsers] = useState([])
  const [send] = useSocket(socket, {
    open: () => {
      send({ type: 'join', payload: { room: 1 }})
    },
    close: () => {
      send({ type: 'leave', payload: { room: 1 }})
    },
    'room_state': (msg) => {
      console.log('Joined!', msg)
      setUsers(msg?.users)
    },
  })

  function login() {
    fetch('/api/auth/login', {
      method: 'POST',
      credentials: 'include',
    })
      .then(res => {
        restartSocket()
        send({ type: 'join', payload: { room: 1 }})
        console.log('res', res)
      })
  }

  return (
    <>
      <button onClick={login}>
        Login
      </button>
      <div className="card">
        {JSON.stringify(users)}
      </div>
    </>
  )
}

export default App
