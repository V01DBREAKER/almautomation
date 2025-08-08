import { useAuth } from "../hooks/AuthProvider"
import React, {type Dispatch} from "react"
import type { dashboardTab } from "../views/Dashboard"
import { tabButtonStyle1 } from "./ComponentStyles"

interface TopBarProps {
    setTab: Dispatch<React.SetStateAction<number>>
    tabs: dashboardTab[]
}
const TopBar: React.FC<TopBarProps> = (props:TopBarProps) => {
    const user = useAuth()!
    return (
        <div className={`flex w-full bg-AAquaternary block h-[3rem] mb-[0.5rem] border-[0.3rem] border-AAsenary rounded-lg items-center`}>
            <span className="inline-block text-white text-[2rem] ml-[0.2rem] mr-[1rem] font-[consolas]">ALM Automation</span>
            <div>
            {props.tabs.map(({element:_, name}, i)=>{
                return (<button className={`${tabButtonStyle1} mr-[0.1rem] w-[8rem] text-[1rem]/[1rem]`} onClick={()=>props.setTab(i)}>{name}</button>)
            })}
            </div>
            <button className={`absolute right-[1rem] ${tabButtonStyle1}`} onClick={user.logout}>Logout</button>
        </div>
    )
}

export default TopBar