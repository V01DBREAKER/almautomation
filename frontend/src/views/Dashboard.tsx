import React from "react"
import TicketSearch from "../components/TicketSearch"
import { useAuth } from "../hooks/AuthProvider"

const Dashboard: React.FC = ()  => {
  const user = useAuth()!

  const dashCellClass = `border-[0.3rem] border-senary rounded-xl p-[0.2rem] bg-secondary`;

  return (
    <div className='fixed left-0 top-0 h-full w-full justify-center items-center p-[0.5rem] @container-[size]'>
      <div className={`flex bg-quaternary block h-[3rem] mb-[0.5rem] border-[0.3rem] border-senary rounded-lg items-center`}>
        <span className="absolute left-[2rem] text-white text-[2rem]">ALM Automation</span>
        <button className="absolute right-[1rem] h-[2rem] bg-primary hover:bg-teritary rounded-lg border-teritary border-[0.2rem] p-[0.1rem]" onClick={user.logout}>Logout</button>
      </div>
      <div className='grid grid-cols-2 lg:grid-cols-4 grid-rows-4 @lgy:grid-rows-6 gap-[0.75rem] w-full h-full'>
        <span className={`${dashCellClass} row-span-2 col-span-1`}>
          <TicketSearch/>
        </span>
        <span className={`${dashCellClass} row-span-1`}>cell2</span>
        <span className={`${dashCellClass} row-span-1`}>cell3</span>
        <span className={`${dashCellClass} row-span-1`}>cell4</span>
        <span className={`${dashCellClass} row-span-2`}>cell5, etc <br/> add more cells in code!</span>
      </div>
    </div>
  )
}

export default Dashboard
