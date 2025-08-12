import { useAuth } from "../hooks/AuthProvider"
import React, {type Dispatch} from "react"
import type { dashboardTab } from "../views/Dashboard"
import { tabButtonStyle1, tabButtonStyle1ToggleOff, tabButtonStyle1ToggleOn } from "./ComponentStyles"

interface TopBarProps {
    setTab: (i:number)=>void
    currentTab: number
    tabs: dashboardTab[]
}
const TopBar: React.FC<TopBarProps> = (props:TopBarProps) => {
    const user = useAuth()!
    return (
        <div className={`flex w-full bg-AAquaternary block h-[3rem] mb-[0.5rem] border-[0.3rem] border-AAsenary rounded-lg items-center`}>
            <span className="inline-block text-white text-[2rem] ml-[0.2rem] mr-[1rem] font-[consolas]">ALM Automation</span>
            <div className="flex h-full">
            {props.tabs.map(({element:_, name}, i)=>{
                return (<button className={`${tabButtonStyle1} mr-[0.1rem] w-[8rem] text-[1rem]/[1rem] ${props.currentTab === i ? tabButtonStyle1ToggleOn : tabButtonStyle1ToggleOff}`} onClick={()=>props.setTab(i)} key={`${i}`}>{name}</button>)
            })}
            </div>
            <button className={`absolute right-[1rem] ${tabButtonStyle1} ${tabButtonStyle1ToggleOff}`} onClick={user.logout}>Logout</button>
        </div>
    )
}

export default TopBar