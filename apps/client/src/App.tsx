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
            console.log("name", name)
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
        {JSON.stringify(db.tables.users.list)}
      </div>
    </>
  )
})

export default App
