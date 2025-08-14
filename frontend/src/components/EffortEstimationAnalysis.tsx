import { useState, useRef} from 'react'

import { getIDsFromQuery, getManyEffortEstimationFields } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../hooks/almAPI/almTypes';
import { askChat4omini } from '..//hooks/llmAPI/llmHooks'

import { buttonStyle2, inputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles'
import { Table, TableHeader, TableBody, TableCell, TableRow, TableHead } from './ui/table';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';

type analysisResult = {
    id: number
    summary: string
    summaryAnalysis: string
    analysisTicket: {
        id: number
        summary: string
        description:string
    } | undefined
    score: number
    reasoning: string
}

type searchResults = {
    analysis: analysisResult[]
    total: number
}

const hasSYSX00 = (s: string):boolean => {
    return Boolean(s.search("SYS\s*[6-8]00"))
}

interface EffortEstimationAnalysisProps {}

const EffortEstimationAnalysis: React.FC<EffortEstimationAnalysisProps> = (_:EffortEstimationAnalysisProps) => {
    const [query, updateQuery] = useState<string>("")
    const [results, setResults] = useState<undefined | searchResults>()
    const [description, updateDescription] = useState<string>()

    const context = `You are a senior System Design Engineer scoring the contents of 
                     the Rough effort estimation for realization in hours (domain specific) header of ticket 1 and seeing if it aligns with the Effort Estimate Summary header in ticket 2. 
                     As well as considering any additional prompts by the user.
                     Give each ticket pair a score between 0 to 1 and return this score at the start of your response with the following format:
                     {"points":score} where score is a floating point number between 0 and 1.
                     Ensure that the JSON is at the beginning of your response, then include your reasoning afterwards. 
                     Your reasoning must be formatted as HTML.
                     Split the json and reasoning with a newline.`;
    const prompt = [`Ticket 1:
                     \`\`\``,
                    `\`\`\`
                     Ticket 2:
                     \`\`\``,
                    `\`\`\`
                     Consider the following in your scoring:
                     Does the number of hours in ticket 1 make sense for the description? Ticket 1 should be the analysis ticket for ticket 2's topic.
                     Does the number of hours in ticket 2 align with the number of hours in ticket 1?
                     Does the number of hours make sense between the domains that hours are assigned to?`
    ]

    const outputRef = useRef(null)
    const user = useAuth()!

    const analyseTicket = async (t1summary:string, t1description:string, t2summary:string, t2description:string): Promise<{score: number, reasoning:string}> => {
        const response = (await askChat4omini(context, prompt[0] + t1summary +"\n"+ t1description + prompt[1] + t2summary + "\n" + t2description + prompt[2], user.token)).choices[0].message.content
        const json = response.split("\n")[0].trim()
        return {score: JSON.parse(json).points, reasoning: response.split("\n").slice(1).join("\n").trim()}
    } 

    const mockAnalyseTicket = async (t1summary:string, t1description:string, t2summary:string, t2description:string): Promise<{score: number, reasoning:string}> => {
        return {score: Math.random(), reasoning: "This is a mock response, the scores are randomly generated to save on tokens." }
    }

    const search = () => {
        // get ticket by id, get its parent, get summary analysis of both tickets. Check for hours.
        (async ()=>{
            const ticketIds = !Number.isNaN(Number(query)) ? [Number(query)] : await getIDsFromQuery(query, user.token)
            updateDescription(`Found tickets...`);
            const tickets = await getManyEffortEstimationFields(ticketIds, user.token)
            updateDescription(`Getting child tickets and looking for SYSX00s`);
            const ticketsWithChildren: analysisResult[] = tickets.map(ticket => {
                if (!ticket.children) {
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, analysisTicket: undefined, score: 0, reasoning: "Ticket has no child ticket"} as analysisResult
                } else if (Array.isArray(ticket.children)){
                    // should only be one ticket with SYSX00 title
                    const sysTicket = ticket.children.find((c)=>hasSYSX00(c.formattedSummary))
                    const analysisTicket = sysTicket ? {id: sysTicket.id, summary: sysTicket.formattedSummary, description: sysTicket.formattedDescription} : undefined
                    const issue = analysisTicket ? {score: 0, reasoning: "No SYSX00 child analysis ticket found."} : {score: NaN, reasoning: ""}
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, analysisTicket: analysisTicket, ...issue} as analysisResult
                } else {
                    const issue = hasSYSX00(ticket.children.formattedSummary) ? {score: 0, reasoning: "No SYSX00 child analysis ticket found."} : {score: NaN, reasoning: ""}
                    return {id: ticket.id, summary: ticket.formattedSummary, summaryAnalysis: ticket.summaryAnalysis, analysisTicket: {id: ticket.children.id, summary: ticket.children.formattedSummary, description: ticket.children.formattedDescription}, ...issue} as analysisResult
                }
            })
            const analyser = ticketsWithChildren.length <= 10 ? analyseTicket : mockAnalyseTicket
            updateDescription(`Running AI on valid ticket pairs...`);
            const results = ticketsWithChildren.map(async ticket => {
                if (ticket.analysisTicket) {
                    // t1 is analysis ticket (child), t2 is feature ticket (parent)
                    const {score, reasoning} = await analyser(ticket.analysisTicket.summary, ticket.analysisTicket.description, ticket.summary, ticket.summaryAnalysis)
                    return {...ticket,
                        score,
                        reasoning,
                    }
                } else {
                    return ticket
                }
            })
            // Wait for all promises to resolve
            return await Promise.all(results)
        })().then(tickets=>{
            // do any filtering here
            const finalResults = {analysis: tickets, total: tickets.length} as searchResults
            setResults(finalResults)
        }).catch(err=>{
            console.error(err)
            setResults(undefined)
            updateDescription(String(err))
        })
    }

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
            <span className={`${outputStyle2} flex flex-grow flex-col`} ref={outputRef}>
                {results ? <div className='flex flex-grow flex-col'>
                    <div className='w-full flex items-center justify-evenly'>
                        <span>Results for&nbsp;<code className='bg-gray-100'>{query}</code>.</span>
                        <span>Hover over score and click id or summary for ticket details.</span>
                        <span><i>{results.analysis.filter(t=>t.analysisTicket).length}</i>&nbsp;out of&nbsp;<i>{results.total}</i>&nbsp;found to have a child analysis tickets</span>
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
                                        <a href={`${almWorkItemUrl}/${result.id}`} target='_blank' className='block w-full h-full hover:outline-black hover:outline-[0.1rem] rounded-md text-center p-[0.1rem]'>{result.id}</a>
                                    </TableCell>
                                    <TableCell className='align-top'>{result.score}</TableCell>
                                    <TableCell>
                                        <Accordion type="single" collapsible>
                                            <AccordionItem value='item-1'>
                                                <AccordionTrigger className='p-0'><span dangerouslySetInnerHTML={{__html: result.summary}}/></AccordionTrigger>
                                                <AccordionContent>
                                                    {result.analysisTicket ? <>
                                                        <h3 className='font-bold'>AI Reasoning:</h3>
                                                        <span dangerouslySetInnerHTML={{__html: result.reasoning }}/>
                                                        <br/><hr/>
                                                        <span dangerouslySetInnerHTML={{ __html: result.summaryAnalysis}}/><br/>
                                                        <br/><hr/><br/>
                                                        <span dangerouslySetInnerHTML={{ __html: result.analysisTicket?.summary}} className='font-bold'/><br/>
                                                        <span dangerouslySetInnerHTML={{ __html: result.analysisTicket?.description}}/>
                                                        
                                                    </>: <>
                                                        <span dangerouslySetInnerHTML={{ __html: result.summaryAnalysis}}/>
                                                        <br/><hr/><span>{result.score}</span>
                                                        <span dangerouslySetInnerHTML={{__html: result.reasoning}}/>
                                                    </>}
                                                </AccordionContent>
                                            </AccordionItem>
                                        </Accordion>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                    </div>
                : description}
            </span>
        </div>
    )
}

export default EffortEstimationAnalysis