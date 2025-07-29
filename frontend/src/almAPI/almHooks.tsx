import axios from 'axios';

const api = "https://localhost:3001/api/"

const getDescFromID = async (id: number, username:string, password:string):Promise<string> => {
    try{
        const response = await axios.post(
        `${api}workitem?fields=workitem/workItem[id=${id}]/summary`, 
        {username: username, password: password });
        return response.data;
    } catch (error) {
        console.error('Fetch failed:', error);
        return "Error fetching description";
    }
};

export { getDescFromID };