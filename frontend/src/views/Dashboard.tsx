import React, { useState, type ReactElement } from "react"
import FeatureVsAnalysis from "../components/FeatureVsAnalysis"
import TopBar from "../components/TopBar"
import ProblemTicketAnalysis from "../components/ProblemTicketAnalysis"
import LLMAnalysis from "@/components/LLMAnalysis"

export interface dashboardTab {
  element: ReactElement
  name: string
}

const Dashboard: React.FC = ()  => {
  const [tab, setTab] = useState<number>(0)
  const dashCellClass = `border-[0.3rem] border-AAsenary rounded-xl p-[0.2rem] bg-AAsecondary`;

  const changeTab = (i:number)=>setTab(i) 
  
  return (
    <div className='flex flex-col w-[100vw] h-[100vh] justify-center items-center p-[0.5rem] @container-[size]'>
      <TopBar setTab={changeTab} currentTab={tab} tabs={dashboardTabs}/>
      <div className={`flex flex-grow w-full overflow-y-auto ${dashCellClass} `}>
        {dashboardTabs[tab].element}
      </div>
    </div>
  )
}

const dashboardTabs: dashboardTab[] = [
  {element: <ProblemTicketAnalysis/>, name: "Problem Ticket Analysis"},
  {element: <FeatureVsAnalysis/>, name: "Analyse Effort Estimations"},
  {element: <LLMAnalysis/>, name: "Chat to AI"},
]

export default Dashboard
