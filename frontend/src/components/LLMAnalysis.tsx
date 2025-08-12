import { useState, useEffect, useRef} from 'react'
import { getOverviewFromID} from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../hooks/almAPI/almTypes';
import { askChat4omini} from '../hooks/llmAPI/llmHooks';
import { buttonStyle2, inputStyle1, outputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles';

interface LLMAnalysisProps {}

const LLMAnalysis: React.FC<LLMAnalysisProps> = (_:LLMAnalysisProps) => {
    const [id, updateID] = useState<number>(0);
    const context = "You are a helpful assistant to a senior system engineer. You must output your response in html otherwise the system will break."
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
            return [`Ticket <a href="${almWorkItemUrl}/${id}">${id}</a><br/>${workItem.formattedSummary}<br/>${workItem.formattedDescription}`, chatResponse.choices[0].message.content]
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
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                Enter a prompt and a ticket id, for the AI (ChatGPT-4.0 mini) to read:
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[4rem] gap-[0.2rem]'>
                <textarea
                    className={`${inputStyle1} col-span-3 row-span-2 resize-none`}
                    placeholder="Your prompt here. e.g. Assess the quality of this ticket." 
                    onChange={(e)=>{updatePrompt(e.target.value)}}
                />
                <input 
                    className={`${inputStyle1} col-span-1`}
                    type="number" placeholder="101100" 
                    onChange={(e)=>{updateID(Number(e.target.value))}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Compare</button>
            </div>
            <div className="flex grid grid-cols-2 flex-grow">
                <span className={`${outputStyle1}`} ref={ticketRef}/>
                <span className={`${outputStyle2} flex-grow`} ref={chatRef}/>
            </div>
        </div>
    )
}

export default LLMAnalysis