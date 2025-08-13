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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

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

type analysisResult = {
    id: number,
    summary: string,     //html
    description: string, //html
    headers: string[],
    scores: number[],
    average: number
}

type searchResults = {
    analysis: analysisResult[]
    total: number
}

const ProblemTicketAnalysis: React.FC<ProblemTicketAnalysisProps> = (_:ProblemTicketAnalysisProps) => {
    const [query, updateQueryId] = useState<string>("");
    const [results, setResults] = useState<undefined | searchResults>()
    const [chat, updateChat] = useState<string>("");
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

    const analyseTicket = async (summary:string, description: string): Promise<ProblemAnalysisSummaryResults> => {
        const json = (await askChat4omini(context, promptStart + summary + promptMiddle + description + promptEnd, user.token)).choices[0].message.content
        return JSON.parse(json)
    } 

    const mockAnalyseTicket = async (summary: string, description: string): Promise<ProblemAnalysisSummaryResults> => {
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
     

    const search = () => {
        updateChat(`Loading...`);
        (async ()=>{
            // filter only Problem ticket Ids
            const ticketIds = !Number.isNaN(Number(query)) ? [Number(query)] : await getIDsFromQuery(query, user.token)
            updateChat(`Found tickets...`);
            const analyser = ticketIds.length <= 10 ? analyseTicket : mockAnalyseTicket
            const ticketTypes = await getManyType(ticketIds, user.token)
            updateChat(`Filtering non-problem type tickets...`);
            const filteredTicketIds = ticketIds.length == 1 ? ticketIds : ticketTypes.filter(ticket=>almTypeIds.problem === ticket.type.id).map(ticket=>ticket.id)
            // get ticket problem summaries
            updateChat(`Getting ticket details...`);
            const problemTickets = await getManyProblemTicket(filteredTicketIds, user.token)
            // apply AI to each id
            updateChat(`Applying AI...`);
            const response = problemTickets.map(async ticket=>
                ({id: ticket.id, summary: ticket.formattedSummary, description: ticket.problemAnalysisSummary, response: await analyser(ticket.formattedSummary, ticket.problemAnalysisSummary)}))
            // Wait for all promises to resolve
            return {results: await Promise.all(response), totalTickets: ticketIds.length}
        })().then((searchResult)=>{
            const {results, totalTickets} = searchResult
            updateChat(`Filtering tickets for scores under 0.5 on any header`);
            const filteredResults = totalTickets == 1 ? results : results.filter(ticket=>
                Object.keys(ticket.response).reduce((acc, k)=>ticket.response[k]<=threshold ? true : acc, false)
            )
            const ticketResults = filteredResults.map(ticket=>{
                const keys = Object.keys(ticket.response)
                return {
                    id: ticket.id,
                    summary: ticket.summary,
                    description: ticket.description,
                    headers: keys,
                    scores: keys.map(k=>ticket.response[k]),
                    average: Math.round(keys.reduce((acc, k)=>acc+ticket.response[k], 0)/keys.length*100)/100
                }
            })
            if (ticketResults.length < 1) throw "No tickets which match the criteria found. Type:Problem; AIScore:headers<0.5";
            const finalResults = {analysis: ticketResults, total: totalTickets} as searchResults
            setResults(finalResults)
        }).catch(err=>{
            console.error(err)
            setResults(undefined)
            updateChat(String(err))
        })
    }

    return ( 
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                Enter a query Id containing problem tickets for the AI to analyse.<br/>Note: the scoring by AI is fake if the query has more than 10 tickets, to save on tokens.
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
            <span className={`${outputStyle2} flex flex-grow flex-col`} ref={chatRef}>
                {results ? 
                    (results.analysis.length > 1 ? <div className='flex flex-grow flex-col'>
                        <div className='w-full grid grid-cols-3'>
                            <span className='flex text-left'>Results for &nbsp;<code className='bg-gray-100'>{query}</code></span>
                            <span className='text-center'>Hover over score and click id or summary for ticket details.</span>
                            <span className='text-right'><i>{results.analysis.length}</i>&nbsp;out of&nbsp;<i>{results.total}</i>&nbsp;found to have a header with score under&nbsp;<b>0.5</b></span>
                        </div>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className='text-center'>ID</TableHead>
                                    <Tooltip>
                                        <TooltipTrigger asChild><TableHead>Score</TableHead></TooltipTrigger>
                                        <TooltipContent><span>Average score of all headers for this ticket. If any header is below 0.5, the ticket will appear on this list.</span></TooltipContent>
                                    </Tooltip>
                                    <TableHead>Summary</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {results.analysis.map(result=>(
                                    <TableRow>
                                        <TableCell className='align-top'>
                                            <a href={`${almWorkItemUrl}/${result.id}`} target='_blank' className='block w-full h-full hover:outline-black hover:outline-[0.1rem] rounded-md text-center'>{result.id}</a>
                                        </TableCell>
                                        <Tooltip delayDuration={1000}>
                                            <TooltipTrigger asChild><TableCell className='align-top'>{result.average}</TableCell></TooltipTrigger>
                                            <TooltipContent><Table>
                                                <TableBody>{result.headers.map((k, i)=>(<TableRow>
                                                    <TableCell>{k}</TableCell>
                                                    <TableCell>{result.scores[i]}</TableCell>
                                                </TableRow>))}</TableBody>
                                                <TableFooter><TableRow><TableCell>Average</TableCell><TableCell>{result.average}</TableCell></TableRow></TableFooter>
                                            </Table></TooltipContent>
                                        </Tooltip>
                                        <TableCell>
                                            <Accordion type="single" collapsible>
                                                <AccordionItem value='item-1'>
                                                    <AccordionTrigger className='p-0'><span dangerouslySetInnerHTML={{__html: result.summary}}/></AccordionTrigger>
                                                    <AccordionContent><span dangerouslySetInnerHTML={{ __html: result.description }}/></AccordionContent>
                                                </AccordionItem>
                                            </Accordion>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>: <>
                        {console.log(results)}
                        <h3 dangerouslySetInnerHTML={{__html:results!.analysis[0].summary}}/><br/>
                        <FixedBarChart data={results!.analysis[0].headers.map((name, i)=>({name, value: results!.analysis[0].scores[i]}))}/>
                        <span dangerouslySetInnerHTML={{__html:results!.analysis[0].description}}/>
                    </>) : chat}
            </span>
        </div>
    )
}

export default ProblemTicketAnalysis