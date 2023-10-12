import { observer } from 'mobx-react-lite'
import { db } from '@/lib/mob-base'
import './App.css'

const App = observer(function App() {
  return (
    <>
      <div className="card">
        <div>
        <form onSubmit={(e) => {
          e.preventDefault()
          const formdata = new FormData(e.target as HTMLFormElement)
          const name = formdata.get('name')
          if (name) {
            db.tables.users.create({
              name: name.toString(),
            })
            e.target.name.value = ''
          } else {
            console.warn('Name empty')
          }
        }}>
          <input type="text" placeholder="Name" name="name" />
          <button type="submit">+</button>
        </form>
        </div>
        {db.tables.users.list.map((user) => {
          return (
            <div className="flex flex-row gap-5" key={user.id}>
              <div>{user.name} / {user.id}</div>
              <button onClick={() => {
                db.tables.users.delete(user.id)
              }}>X</button>
            </div>
          )
        })}
      </div>
    </>
  )
})

export default App
