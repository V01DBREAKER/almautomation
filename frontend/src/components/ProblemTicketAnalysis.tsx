import { type JSX, useState, useEffect, useRef} from 'react'
import { getIDsFromQuery, getProblemAnalysisSummary, getType} from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almTypeIds } from '../hooks/almAPI/almTypes';
import { askChat4omini} from '../hooks/llmAPI/llmHooks';
import { buttonStyle2, inputStyle1, outputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles';
import { almProblemAnalysisSummaryTemplate } from '../hooks/almAPI/almTemplates';
import FixedBarChart from './FixedBarChart';

interface ProblemTicketAnalysisProps {}

// This tool should take a query for problem tickets and run a AI on them with the problem work item template and rate on a scale of 1 to 5 how well they filled out the template
// Exclude non problem tickets
// Create a list of under performing tickets 
//    Average under 3
//    Be able to filter by header rating
//    Create a bar graph of all ticket ratings
//    Extend bar graph to display specific headers

type ProblemAnalysisSummaryResults = {
     "Root Cause": number,
     "Dependencies": number, 
     "Corrective Actions": number, 
     "Impacts": number,
     "Recommendations": number, 
     "Reason for delay of analysis": number, 
     "Effort Estimate Summary": number,
     [key: string]: number;
}

const ProblemTicketAnalysis: React.FC<ProblemTicketAnalysisProps> = (_:ProblemTicketAnalysisProps) => {
    const [query, updateQueryId] = useState<string>("");
    const [chat, updateChat] = useState<JSX.Element>();
    const context = `You are a senior System Design Engineer scoring problem analysis summaries based on the problem work item template and any additional prompts by the user.
                     This is the problem analysis summary template:
                     \`\`\`
                     ${almProblemAnalysisSummaryTemplate}
                     \`\`\`
                     Give each header a score between 0 to 1 and return this score as json at the start of your response with the following format:
                     {"Header_name":score,"header2_name":score,"header3_name":score} where score is an floating point number between 0 and 1.
                     Ensure that your response is pure JSON. Do not include chatter. If your response is not a pure JSON, the system will crash.`;
    const promptStart= `Given the below ticket, how well has the author filled and addressed the template headers? 
                        Ticket:
                        \`\`\``;
    const promptEnd = "\n```";

    const chatRef = useRef(null)

    const user = useAuth()!

    const analyseTicket = async (id: number): Promise<ProblemAnalysisSummaryResults> => {
        const ticket = await getProblemAnalysisSummary(id, user.token)
        const json = (await askChat4omini(context, promptStart + ticket.defectDescription + promptEnd, user.token)).choices[0].message.content
        return JSON.parse(json)
    } 

    const search = () => {
        if (!Number.isNaN(Number(query))) {
            const ticketId = Number(query)
            analyseTicket(ticketId).then(res=>{
                const data = Object.keys(res).map(k=>({name: k, value: res[k]}))
                updateChat(
                    <div>
                    {Object.keys(res).map(k=>(`${k}:${res[k]};`))}
                    <FixedBarChart data={data}/>
                    </div>
                )
            })
        } else {
            updateChat(<span>"Functionality not implemented for queryIds yet, use a ticket id instead."</span>);
            // (async ()=>{
            //     // filter only Problem ticket Ids
            //     const ticketIds = await getIDsFromQuery(query, user.token)
            //     const filteredTicketIds = ticketIds.filter(async id=>{
            //         const ticket_type = await getType(id, user.token)
            //         if (ticket_type.id === -1) return false
            //         return almTypeIds.problem === ticket_type.type.id
            //     })
            //     // apply AI to each id
            //     const results = filteredTicketIds.map(async id=>{
            //         return {id: id, results: await analyseTicket(id)}
            //     })
            //     // summarise results
            //     return results.join('<br/>')
            // })().then(res=>console.log(res))
        }
    }

    return ( 
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                Enter a query Id containing problem tickets for the AI to analyse.
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem] gap-[0.2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`}
                    type="search" placeholder="Query ID" 
                    onChange={(e)=>{updateQueryId(e.target.value.trim())}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Analyse Tickets</button>
            </div>
            <span className={`${outputStyle2} flex-grow`} ref={chatRef}>
                {chat}
            </span>
        </div>
    )
}

export default ProblemTicketAnalysis