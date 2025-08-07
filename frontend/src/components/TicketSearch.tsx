import { useState, useEffect, useRef} from 'react'
import { getOverviewFromID } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../hooks/almAPI/almTypes'
import { buttonStyle2, inputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles'

interface TicketSearchProps {}

const TicketSearch: React.FC<TicketSearchProps> = (_:TicketSearchProps) => {
    const [id, updateID] = useState<number>(0)
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        getOverviewFromID(id, user.token).then(res=>{
            if (res.id === -1) {
                updateDescription(`Could not find workitem ${id}`);
            } else {
                const description = `<a href="${almWorkItemUrl}/${res.id}">${res.id}</a><br/>${res.formattedSummary}<br/>${res.formattedDescription}`;
                updateDescription(description)
            }
        })
    }

    useEffect(() => {
        if (spanRef.current) {
        (spanRef.current as HTMLSpanElement).innerHTML = description || "";
        }
    }, [description])

    return (
        <div className={`overflow-y-auto ${tabStyle1}`}>
            <span className={titleStyle1}>Work Item Search by ID</span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`} 
                    type="number" placeholder="101100" 
                    onChange={(e)=>{updateID(Number(e.target.value))}}
                />
                <button
                    className={buttonStyle2} 
                    onClick={search}
                >Search</button>
            </div>
            <div className={`flex-grow ${outputStyle2}`} >
                <span ref={spanRef}/> 
            </div>
        </div>
    )
}

export default TicketSearch