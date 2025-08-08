import { useState, useEffect, useRef} from 'react'
import { getIDsFromQuery, getProblemAnalysisSummary, getType} from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almTypeIds } from '../hooks/almAPI/almTypes';
import { askChat4omini} from '../hooks/llmAPI/llmHooks';
import { buttonStyle2, inputStyle1, outputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles';
import { almProblemAnalysisSummaryTemplate } from '../hooks/almAPI/almTemplates';

interface ProblemTicketAnalysisProps {}

// This tool should take a query for problem tickets and run a AI on them with the problem work item template and rate on a scale of 1 to 5 how well they filled out the template
// Exclude non problem tickets
// Create a list of under performing tickets 
//    Average under 3
//    Be able to filter by header rating
//    Create a bar graph of all ticket ratings
//    Extend bar graph to display specific headers

const ProblemTicketAnalysis: React.FC<ProblemTicketAnalysisProps> = (_:ProblemTicketAnalysisProps) => {
    const [id, updateQueryId] = useState<string>("");
    const [chat, updateChat] = useState<string>("");
    const context = "You are a senior System Design Engineer.";
    const promptStart= `Here is the ticket template:
                        \`\`\`${almProblemAnalysisSummaryTemplate} \`\`\`
                        Given the below ticket, how well has the author filled and addressed the template headers?
                        Give each header a score between 0 to 10 and return this score as json at the start of your response with the following format:
                        {"Header_name":score,"header2_name":score,"header3_name":score} where score is an integer
                        Ticket:
                        \`\`\``;
    const promptEnd = "\n```";

    const chatRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        // (async ()=>{
        //     // filter only Problem ticket Ids
        //     const ticketIds = await getIDsFromQuery(id, user.token)
        //     const filteredTicketIds = ticketIds.filter(async id=>{
        //         const ticket_type = await getType(id, user.token)
        //         if (ticket_type.id === -1) return false
        //         return almTypeIds.problem === ticket_type.type.id
        //     })
        //     // apply AI to each id
        //     const results = filteredTicketIds.map(async id=>{
        //         const ticket = await getProblemAnalysisSummary(id, user.token)
        //         return (await askChat4omini(context, promptStart + ticket.defectDescription + promptEnd, user.token)).choices[0].message.content
        //     })
        //     // summarise results
        //     return results.join('<br/>')
        // })
        const id = 980320;
        (async ()=>{
            const ticket = await getProblemAnalysisSummary(id, user.token)
            return (await askChat4omini(context, promptStart + ticket.defectDescription + promptEnd, user.token)).choices[0].message.content
        })().then(res=>{
            console.log(res)
            updateChat(res)
        })


    }

    useEffect(() => {
        if (chatRef.current)
            (chatRef.current as HTMLSpanElement).innerHTML = chat || "";
    }, [chat])

    return ( 
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                Enter a query Id containing problem tickets for the AI to analyse.
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem] gap-[0.2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`}
                    type="search" placeholder="Query ID" 
                    onChange={(e)=>{updateQueryId(e.target.value)}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Analyse Tickets</button>
            </div>
            <span className={`${outputStyle1} flex-grow`} ref={chatRef}/>
        </div>
    )
}

export default ProblemTicketAnalysis