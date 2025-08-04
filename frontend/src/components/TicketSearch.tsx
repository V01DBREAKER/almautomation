import { useState, useEffect, useRef} from 'react'
import { getOverviewFromID } from '../almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../almAPI/almTypes'

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
        <div className='flex-inline w-full h-full flex-col'>
            <span className='flex justify-center h-[1.4rem] text-white w-full font-bold'>
                Work Item Search by ID
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className='bg-quaternary border-senary border-[0.2rem] rounded-lg text-white mr-2 col-span-3' 
                    type="number" placeholder="101100" 
                    onChange={(e)=>{updateID(Number(e.target.value))}}
                />
                <button
                    className="bg-quaternary hover:bg-senary border-senary border-[0.2rem] text-white rounded-lg" 
                    onClick={search}
                >Search</button>
            </div>
            <div className='flex-grow overflow-y-scroll rounded-lg h-[76%]'>
                <span className="block bg-white" ref={spanRef}></span>
            </div>
        </div>
    )
}

export default TicketSearch