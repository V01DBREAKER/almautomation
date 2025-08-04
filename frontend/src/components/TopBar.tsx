import { useAuth } from "../hooks/AuthProvider"

const TopBar: React.FC = () => {
const user = useAuth()!
    return (
        <div className={`flex bg-quaternary block h-[3rem] mb-[0.5rem] border-[0.3rem] border-senary rounded-lg items-center`}>
        <span className="absolute left-[2rem] text-white text-[2rem]">ALM Automation</span>
        <button className="absolute right-[1rem] h-[2rem] bg-primary hover:bg-teritary rounded-lg border-teritary border-[0.2rem] p-[0.1rem]" onClick={user.logout}>Logout</button>
        </div>
    )
}

export default TopBar