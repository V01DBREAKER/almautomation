import { useState, useEffect, useRef} from 'react'
import './App.css'
import Login from './Login'
import { getDescFromID } from './almAPI/almHooks'


function App() {
  const [id, updateID] = useState<number>(0)
  const [description, updateDescription] = useState<string>()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [entryStatus, setStatus] = useState(false);

  const spanRef = useRef(null)

  useEffect(() => {
    if (spanRef.current) {
      (spanRef.current as HTMLSpanElement).innerHTML = description || "";
    }
  }, [description])

  return (
    <>
      {!entryStatus ? (
        <Login entryStatus={entryStatus} setStatus={setStatus} username={username} setUsername={setUsername} password={password} setPassword={setPassword}/>
      ) : (<>
        <div>
          <input type="number" onChange={(e)=>{updateID(Number(e.target.value))}}></input>
          <button onClick={()=>getDescFromID(id, username, password).then(updateDescription)}/>
        </div>
        <span ref={spanRef}></span>
      </>)}
    </>
  )
}

export default App
