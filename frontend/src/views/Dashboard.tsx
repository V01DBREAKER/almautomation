import React from "react"
import TicketSearch from "../components/TicketSearch"
import QuerySearch from "../components/QuerySearch"
import FeatureVsAnalysis from "../components/FeatureVsAnalysis"
import TopBar from "../components/TopBar"
import LLMAnalysis from "../components/LLMAnalysis"

const Dashboard: React.FC = ()  => {
  const dashCellClass = `border-[0.3rem] border-senary rounded-xl p-[0.2rem] bg-secondary`;
  
  return (
    <div className='fixed left-0 top-0 h-full w-full justify-center items-center p-[0.5rem] @container-[size]'>
      <TopBar/>
      <div className='grid grid-cols-2 lg:grid-cols-4 grid-rows-4 @lgy:grid-rows-6 gap-[0.75rem] w-full h-full'>
        <span className={`${dashCellClass} row-span-2 col-span-1`}>
          <TicketSearch/>
        </span>
        <span className={`${dashCellClass} row-span-1`}>cell2</span>
        <span className={`${dashCellClass} row-span-2 col-span-2`}>
          <FeatureVsAnalysis/>
        </span>
        <span className={`${dashCellClass} row-span-1`}>cell4, etc add more cells in code!</span>
        <span className={`${dashCellClass} row-span-2`}>
          <QuerySearch/>
        </span>
        <span className={`${dashCellClass} row-span-2 col-span-3`}><LLMAnalysis/></span>
      </div>
    </div>
  )
}

export default Dashboard
