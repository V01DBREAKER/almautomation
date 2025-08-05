import { useState, useEffect, useRef} from 'react'
import { getOverviewFromID} from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../hooks/almAPI/almTypes';
import { askChat4omini} from '../hooks/llmAPI/llmHooks';

interface LLMAnalysisProps {}

const LLMAnalysis: React.FC<LLMAnalysisProps> = (_:LLMAnalysisProps) => {
    const [id, updateID] = useState<number>(0);
    const [context, updateContext] = useState<string>("");
    const [prompt, updatePrompt] = useState<string>("");
    const [ticket, updateTicket] = useState<string>()
    const [chat, updateChat] = useState<string>()

    const ticketRef = useRef(null)
    const chatRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        (async ()=>{
            const workItem = await getOverviewFromID(id, user.token)
            if (workItem.id === -1) return `Ticket ${id} could not be found.`

            // send description and summary to AI and rate
            const chatResponse = await askChat4omini(context, `Given the following ticket:<br/>\`\`\`Ticket ${workItem.id}<br/>Title: ${workItem.formattedSummary}<br/>Description:${workItem.formattedDescription}\`\`\`</br>Follow the following prompt:\`\`\`${prompt}\`\`\``, user.token)
            return [`Ticket <a href="${almWorkItemUrl}/${id}">${id}</a><br/>${workItem.formattedSummary}`, chatResponse.choices[0].message.content]
        })().then(res=>{
            console.log(res)
            updateTicket(res[0])
            updateChat(res[1])
        })
    }

    useEffect(() => {
        if (ticketRef.current)
            (ticketRef.current as HTMLSpanElement).innerHTML = ticket || "";
        if (chatRef.current)
            (chatRef.current as HTMLSpanElement).innerHTML = chat || "";
    }, [ticket, chat])

    return (
        <div className='flex-inline w-full h-full flex-col'>
            <span className='flex-inline justify-center h-[1.4rem] text-white w-full font-bold'>
                Enter a ticket id, a context and a prompt for the AI to read:
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[4rem] gap-[0.2rem]'>
                <input 
                    className='bg-quaternary border-senary border-[0.2rem] rounded-lg text-white mr-2 col-span-1' 
                    type="number" placeholder="101100" 
                    onChange={(e)=>{updateID(Number(e.target.value))}}
                />
                <input 
                    className='bg-quaternary border-senary border-[0.2rem] rounded-lg text-white mr-2 col-span-3' 
                    type="search" placeholder="Your context here. e.g. You are a helpful assistant!" 
                    onChange={(e)=>{updateContext(e.target.value)}}
                />
                <input 
                    className='bg-quaternary border-senary border-[0.2rem] rounded-lg text-white mr-2 col-span-3' 
                    type="search" placeholder="Your prompt here. e.g. Assess the quality of this ticket." 
                    onChange={(e)=>{updatePrompt(e.target.value)}}
                />
                <button
                    className="bg-quaternary hover:bg-senary border-senary border-[0.2rem] text-white rounded-lg" 
                    onClick={search}
                >Compare</button>
            </div>
            <div className='grid h-[64%] grid-cols-2'>
                <div className='flex-grow rounded-lg'>
                    <span className="block bg-white" ref={ticketRef}></span>
                </div>
                <div className='flex-grow overflow-y-scroll rounded-lg'>
                    <span className="block bg-white" ref={chatRef}></span>
                </div>
            </div>
        </div>
    )
}

export default LLMAnalysis