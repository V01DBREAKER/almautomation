import { useState, useEffect, useRef} from 'react'
import { getIDsFromQuery } from '../almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { getQueryDetails, xmlToJObj} from '../hooks/ParsingTools'
import { almQueryUrl, type apiQuery } from '../almAPI/almTypes'

interface QuerySearchProps {}

const QuerySearch: React.FC<QuerySearchProps> = (_:QuerySearchProps) => {
    const [id, updateID] = useState<string>("")
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        getIDsFromQuery(id, user.token).then(result=>{
            const query:apiQuery = getQueryDetails(result)
            console.log(query)
            if (!query.oslc_cmChangeRequest) {
                updateDescription(`Could not find query ${id}`);
                return;
            }
            const description = query.oslc_cmChangeRequest.map(el=>el.dcidentifier.toString()).concat()
            console.log(description)
            updateDescription(description);
        });
    }

    useEffect(() => {
        if (spanRef.current) {
        (spanRef.current as HTMLSpanElement).innerHTML = description || "";
        }
    }, [description])

    return (
        <div className='flex-inline w-full h-full flex-col'>
            <span className='flex justify-center h-[1.4rem] text-white w-full font-bold'>
                List IDs from Query ID
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className='bg-quaternary border-senary border-[0.2rem] rounded-lg text-white mr-2 col-span-3' 
                    type="search" placeholder="_FBmkkNTZEe7dNdAflPaDsQ" 
                    onChange={(e)=>{updateID(e.target.value)}}
                />
                <button
                    className="bg-quaternary hover:bg-senary border-senary border-[0.2rem] text-white rounded-lg" 
                    onClick={search}
                >Search</button>
            </div>
            <div className='flex-grow overflow-y-scroll rounded-lg h-[76%]'>
                <span className="block bg-white" ref={spanRef}></span>
            </div>
        </div>
    )
}

export default QuerySearch