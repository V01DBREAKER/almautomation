import { useState, useEffect, useRef} from 'react'
import './App.css'
import Login from './Login'
import axios from 'axios';

const base_url = "https://rb-alm-14-p.de.bosch.com/ccm/rpt/repository/"
const api = "https://localhost:3001/api/"

function App() {
  const [id, updateID] = useState<number>(0)
  const [description, updateDescription] = useState<string>()
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [entryStatus, setStatus] = useState(false);

  const spanRef = useRef(null)

  const getDescFromID = async (id: number) => {
    try{
      const response = await axios.post(
        `${api}workitem?fields=workitem/workItem[id=${id}]/summary`, 
        {username: username, password: password });
      updateDescription(response.data)
    } catch (error) {
      console.error('Fetch failed:', error);
    }
  }

// CORS Policy Issue

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
          <button onClick={()=>getDescFromID(id)}/>
        </div>
        <span ref={spanRef}></span>
      </>)}
    </>
  )
}

export default App
