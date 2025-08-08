import React, { useState, type ReactElement } from "react"
import TicketSearch from "../components/TicketSearch"
import QuerySearch from "../components/QuerySearch"
import FeatureVsAnalysis from "../components/FeatureVsAnalysis"
import TopBar from "../components/TopBar"
import LLMAnalysis from "../components/LLMAnalysis"
import ProblemTicketAnalysis from "../components/ProblemTicketAnalysis"

export interface dashboardTab {
  element: ReactElement
  name: string
}

const Dashboard: React.FC = ()  => {
  const [tab, setTab] = useState<number>(0)
  const dashCellClass = `border-[0.3rem] border-senary rounded-xl p-[0.2rem] bg-secondary`;
  
  return (
    <div className='flex flex-col w-[100vw] h-[100vh] justify-center items-center p-[0.5rem] @container-[size]'>
      <TopBar setTab={setTab} tabs={dashboardTabs}/>
      <div className={`flex flex-grow w-full overflow-y-auto ${dashCellClass} `}>
        {dashboardTabs[tab].element}
      </div>
    </div>
  )
}

const dashboardTabs: dashboardTab[] = [
  {element: <FeatureVsAnalysis/>, name: "Analyse Effort Estimations"},
  {element: <ProblemTicketAnalysis/>, name: "Problem Ticket Analysis"}
]

export default Dashboard
