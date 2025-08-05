import { useState, useEffect, useRef} from 'react'
import { getIDsFromQuery } from '../hooks/almAPI/almHooks'
import { useAuth } from '../hooks/AuthProvider'
import { almWorkItemUrl } from '../hooks/almAPI/almTypes'
import { buttonStyle2, inputStyle1, outputStyle2, tabStyle1, titleStyle1 } from './ComponentStyles'

interface QuerySearchProps {}

const QuerySearch: React.FC<QuerySearchProps> = (_:QuerySearchProps) => {
    const [id, updateID] = useState<string>("")
    const [description, updateDescription] = useState<string>()

    const spanRef = useRef(null)

    const user = useAuth()!

    const search = () => {
        getIDsFromQuery(id, user.token).then(res=>{
            if (res.length < 1) {
                updateDescription(`Could not find query ${id}`);
            } else {
                updateDescription(res.map(el=>`<a href="${almWorkItemUrl}/${el}">${el}</a>`).join('<br/>'));
            }
        });
    };

    useEffect(() => {
        if (spanRef.current) {
        (spanRef.current as HTMLSpanElement).innerHTML = description || "";
        }
    }, [description])

    return (
        <div className={tabStyle1}>
            <span className={titleStyle1}>
                List IDs from Query ID
            </span>
            <div className='grid grid-cols-4 my-[0.2rem] h-[2rem]'>
                <input 
                    className={`${inputStyle1} col-span-3`}
                    type="search" placeholder="_FBmkkNTZEe7dNdAflPaDsQ" 
                    onChange={(e)=>{updateID(e.target.value)}}
                />
                <button
                    className={buttonStyle2}
                    onClick={search}
                >Search</button>
            </div>
            <div className={`${outputStyle2} flex-grow`}>
                <span className="block bg-white" ref={spanRef}></span>
            </div>
        </div>
    )
}

export default QuerySearch