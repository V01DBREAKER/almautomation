import { useState, useEffect, useRef} from 'react'
import { getParentId, getSummaryAnalysis, getFormattedDescription } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { buttonStyle2, inputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles'

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
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                Enter a SYS800/700 ticket id:
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`}
                    type="number" placeholder="101100" 
                    onChange={(e)=>{updateID(Number(e.target.value))}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Compare</button>
            </div>
            <div className={`flex-grow ${outputStyle2}`}>
                <span className="block bg-white" ref={spanRef}></span>
            </div>
        </div>
    )
}

export default FeatureVsAnalysis