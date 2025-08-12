import { type JSX, useState, useEffect, useRef} from 'react'
import { getFormattedSummary, getIDsFromQuery, getManyProblemTicket, getManyType, getProblemAnalysisSummary, getType} from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almTypeIds, almWorkItemUrl } from '../hooks/almAPI/almTypes';
import { askChat4omini} from '../hooks/llmAPI/llmHooks';
import { buttonStyle2, inputStyle1, outputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles';
import { almProblemAnalysisSummaryTemplate } from '../hooks/almAPI/almTemplates';
import FixedBarChart from './FixedBarChart';
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead, TableFooter,  } from './ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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
    const promptStart= `Given the following ticket titled,
                        \``
    const promptMiddle = `\`
                          How well has the author filled and addressed the template headers? 
                          Ticket:
                          \`\`\``;
    const promptEnd = "\n```";

    const threshold = 0.5; // if value is <= threshold then it is not good enough!

    const chatRef = useRef(null)

    const user = useAuth()!

    const analyseTicket = async (id: number, summary:string, description: string): Promise<ProblemAnalysisSummaryResults> => {
        const json = (await askChat4omini(context, promptStart + summary + promptMiddle + description + promptEnd, user.token)).choices[0].message.content
        return JSON.parse(json)
    } 

    const mockAnalyseTicket = async (id: number, summary: string, description: string): Promise<ProblemAnalysisSummaryResults> => {
        return {
            'Root Cause': Math.random(),
            Dependencies: Math.random(),
            'Corrective Actions': Math.random(),
            Impacts: Math.random(),
            Recommendations: Math.random(),
            'Reason for delay of analysis': Math.random(),
            'Effort Estimate Summary': Math.random()
        } as ProblemAnalysisSummaryResults;
    }

    // TODO: Add status update messages
    const search = () => {
        if (!Number.isNaN(Number(query))) {
            const ticketId = Number(query);
            (async ()=>{
                updateChat(<span>"Loading..."</span>)
                const ticketType = await getType(ticketId, user.token)
                if (ticketType.type.id === almTypeIds.problem || ticketType.id === -1) {
                    updateChat(<span>{`${ticketId} not found or was not a problem ticket.`}</span>);
                } else {
                    const ticketSummary = await getFormattedSummary(ticketId, user.token);
                    const ticketProblem = await getProblemAnalysisSummary(ticketId, user.token)
                    return analyseTicket(ticketId, ticketSummary.formattedSummary, ticketProblem.description)
                }
                return null
            })().then((res: ProblemAnalysisSummaryResults | null) =>{
                if (res) {
                    const data = Object.keys(res.response).map(k=>({name: k, value: res[k]}))
                    updateChat(
                        <div>
                            {Object.keys(res.response).map(k=>(`${k}:${res[k]};`))}
                            <FixedBarChart data={data}/>
                        </div>
                    )
                }
            })
        } else {
            updateChat(<span>Loading...</span>);
            //return
            (async ()=>{
                // filter only Problem ticket Ids
                const ticketIds = await getIDsFromQuery(query, user.token)
                const ticketTypes = await getManyType(ticketIds, user.token)
                const filteredTicketIds = ticketTypes.filter(ticket=>almTypeIds.problem === ticket.type.id).map(ticket=>ticket.id)
                // get ticket problem summaries
                const problemTickets = await getManyProblemTicket(filteredTicketIds, user.token)
                // apply AI to each id
                const response = problemTickets.map(async ticket=>
                    ({id: ticket.id, summary: ticket.formattedSummary, description: ticket.description, response: await mockAnalyseTicket(ticket.id, ticket.formattedSummary, ticket.description)}))
                // Wait for all promises to resolve
                return Promise.all(response)
            })().then(results=>{
                const filteredResults = results.filter(ticket=>
                    Object.keys(ticket.response).reduce((acc, k)=>ticket.response[k]<=threshold ? true : acc, false)
                )
                // const fullResults = filteredResults.map(ticket=>{
                //     const keys = Object.keys(ticket.response)
                //     return {
                //         id: ticket.id,
                //         summary: ticket.summary,
                //         description: ticket.description,
                //         headers: keys,
                //         scores: keys.map(k=>ticket.response[k]),
                //         average: Math.round(keys.reduce((acc, k)=>acc+ticket.response[k], 0)/keys.length*100)/100
                //     }
                // })
                const tableBody = filteredResults.map(ticket=>(
                    <TableRow>
                        <TableCell><a href={`${almWorkItemUrl}/${ticket.id}`}>{ticket.id}</a></TableCell>
                        <Tooltip>
                            <TooltipTrigger asChild><TableCell>{
                                Math.round(((Object.keys(ticket.response).reduce((acc, k)=>acc+ticket.response[k], 0))/Object.keys(ticket.response).length)*100)/100
                            }</TableCell></TooltipTrigger>
                            <TooltipContent><Table>
                                <TableBody>{Object.keys(ticket.response).map(k=>(<TableRow><TableCell>{k}</TableCell><TableCell>{ticket.response[k]}</TableCell></TableRow>))}</TableBody>
                                <TableFooter><TableRow><TableCell>Average</TableCell><TableCell>{Math.round(((Object.keys(ticket.response).reduce((acc, k)=>acc+ticket.response[k], 0))/Object.keys(ticket.response).length)*100)/100}</TableCell></TableRow></TableFooter>
                            </Table></TooltipContent>
                        </Tooltip>
                        <Tooltip delayDuration={1500}>
                            <TooltipTrigger asChild><TableCell>{ticket.summary}</TableCell></TooltipTrigger>
                            <TooltipContent><span dangerouslySetInnerHTML={{ __html: ticket.description }}/></TooltipContent>
                        </Tooltip>
                    </TableRow>
                ))
                // TODO: Format ID Cell to look like buttons
                // TODO: On row hover, show precise scores
                updateChat(<Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>ID</TableHead>
                            <Tooltip>
                                <TooltipTrigger asChild><TableHead>Score</TableHead></TooltipTrigger>
                                <TooltipContent><span>Average score of all headers for this ticket. If any header is below 0.5, the ticket will appear on this list.</span></TooltipContent>
                            </Tooltip>
                            <TableHead>Summary</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableBody}
                    </TableBody>
                </Table>)
            })
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