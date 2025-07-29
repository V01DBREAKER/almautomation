import { useState, useEffect, useRef} from 'react'
import './App.css'
import { getDescFromID } from '../almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'


function Dashboard() {
  const [id, updateID] = useState<number>(0)
  const [description, updateDescription] = useState<string>()

  const spanRef = useRef(null)

  const user = useAuth()!

  useEffect(() => {
    if (spanRef.current) {
      (spanRef.current as HTMLSpanElement).innerHTML = description || "";
    }
  }, [description])

  return (
    <>
        <button onClick={user.logout}>Logout</button>
        <div>
          <input type="number" onChange={(e)=>{updateID(Number(e.target.value))}}></input>
          <button onClick={()=>getDescFromID(id, user.token).then(updateDescription)}/>
        </div>
        <span ref={spanRef}></span>
    </>
  )
}

export default Dashboard
