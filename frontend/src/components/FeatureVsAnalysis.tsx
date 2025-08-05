import { useState, useEffect, useRef} from 'react'
import { getParentId, getSummaryAnalysis, getFormattedDescription } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'

interface FeatureVsAnalysisProps {}

const FeatureVsAnalysis: React.FC<FeatureVsAnalysisProps> = (_:FeatureVsAnalysisProps) => {
    const [id, updateID] = useState<number>(0)
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        // get ticket by id, get its parent, get summary analysis of both tickets. Check for hours.
        (async ()=>{
            const workItem = await getParentId(id, user.token)
            if (workItem.id === -1) return `Ticket ${id} could not be found.`
            if (workItem.parent === undefined) return `Parent of ticket ${id} could not be found.`
            const analysisDesc = await getFormattedDescription(id, user.token)
            const featDesc = await getSummaryAnalysis(workItem.parent.id, user.token)
            // check for hours
            return `Analysis Ticket ${id} promises the following:<br/>${analysisDesc.formattedDescription}<br/>Feature Ticket ${workItem.parent.id} promises the following:<br/>${featDesc.summaryAnalysis}`
        })().then(res=>{
            updateDescription(res)
        })
    }

    useEffect(() => {
        if (spanRef.current) {
        (spanRef.current as HTMLSpanElement).innerHTML = description || "";
        }
    }, [description])

    return (
        <div className='flex-inline w-full h-full flex-col'>
            <span className='flex-inline justify-center h-[1.4rem] text-white w-full font-bold'>
                Enter a SYS800/700 ticket id:
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
                >Compare</button>
            </div>
            <div className='flex-grow overflow-y-scroll rounded-lg h-[76%]'>
                <span className="block bg-white" ref={spanRef}></span>
            </div>
        </div>
    )
}

export default FeatureVsAnalysis