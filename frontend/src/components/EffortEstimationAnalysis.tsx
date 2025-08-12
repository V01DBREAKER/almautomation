import { useState, useEffect, useRef} from 'react'
import { getParentId, getSummaryAnalysis, getFormattedDescription, getIDsFromQuery, getManyEffortEstimationFields } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { buttonStyle2, inputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles'

type analysisResult = {
    id: number
    summary: string
    summaryAnalysis: string
    analysisTicket: {
        id: number
        summary: string
        description:string
    } | undefined
    issue: {
        hasProblem: boolean
        reason: string
    }
}

const hasSYSX00 = (s: string):boolean => {
    return Boolean(s.match("SYS\s*[6-8]00"))
}

interface EffortEstimationAnalysisProps {}

const EffortEstimationAnalysis: React.FC<EffortEstimationAnalysisProps> = (_:EffortEstimationAnalysisProps) => {
    const [query, updateQuery] = useState<string>("")
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        // get ticket by id, get its parent, get summary analysis of both tickets. Check for hours.
        (async ()=>{
            const ticketIds = !Number.isNaN(Number(query)) ? [Number(query)] : await getIDsFromQuery(query, user.token)
            const tickets = await getManyEffortEstimationFields(ticketIds, user.token)
            const results: analysisResult[] = tickets.map(ticket => {
                if (!ticket.children) {
                    const issue = {hasProblem: true, reason: "Ticket has no children."}
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, issue: issue, analysisTicket: undefined} as analysisResult
                } else if (Array.isArray(ticket.children)){
                    // should only be one ticket with SYSX00 title
                    const analysisTicket = ticket.children.find((c)=>hasSYSX00(c.formattedSummary))
                    const issue = analysisTicket ? {hasProblem: true, reason: "No SYSX00 child analysis ticket found."} : {hasProblem: false, reason: ""}
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, issue: issue, analysisTicket: analysisTicket} as analysisResult
                } else {
                    const issue = hasSYSX00(ticket.children.formattedSummary) ? {hasProblem: true, reason: "No SYSX00 child analysis ticket found."} : {hasProblem: false, reason: ""}
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, issue: issue, analysisTicket: {id: ticket.children.id, summary: ticket.children.formattedSummary, description: ticket.children.formattedDescription}} as analysisResult
                }
            })
            return results
        })().then(tickets=>{
            // run each ticket through LLM and determine if effort estimation is accurate
            // if (tickets.length > 1){

            // } else {

            // }
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
                [WIP]: This tool will investigate the effort estimations of the child SYSX00 tickets compared to the parent tickets provided. Currently not finished :(
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`}
                    type="search" placeholder="Querty ID" 
                    onChange={(e)=>{updateQuery(e.target.value)}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Analyse Tickets</button>
            </div>
            <div className={`${outputStyle2} flex flex-grow`} ref={spanRef}>
            </div>
        </div>
    )
}

export default EffortEstimationAnalysis