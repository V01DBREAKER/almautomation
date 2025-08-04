import { useState, useEffect, useRef} from 'react'
import { getParentId, getSummaryAnalysis } from '../almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl, type almExtension, type apiWorkItem } from '../almAPI/almTypes'

interface FeatureVsAnalysisProps {}

const FeatureVsAnalysis: React.FC<FeatureVsAnalysisProps> = (_:FeatureVsAnalysisProps) => {
    const [id, updateID] = useState<number>(0)
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        const f =  async () => {
            // const parentIdWI:apiWorkItem = getWorkItemDetails(await getParentId(id, user.token))
            // if (!parentIdWI || !parentIdWI.workItem.parent.id) return; //raise error (no parent)
            // const parentSAWI:apiWorkItem = getWorkItemDetails(await getSummaryAnalysis(parentIdWI.workItem.parent!.id, user.token))
            // if (!parentSAWI.workItem.allExtensions.
            // const feature = !largeStringValue
            // console.log(feature)
        }
        f()

        
        // get(id, user.token).then(result=>{
        //     const workItem:apiWorkItem = getWorkItemDetails(result)
        //     if (!workItem || !workItem.workItem) {
        //         updateDescription(`Could not find workitem ${id}`);
        //         return;
        //     }
        //     const description = `<a href="${almWorkItemUrl}/${workItem.workItem.id}">${workItem.workItem.id}</a><br/>${workItem.workItem.summary}<br/>${workItem.workItem.formattedDescription}`;
        //     updateDescription(description);
        // });
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