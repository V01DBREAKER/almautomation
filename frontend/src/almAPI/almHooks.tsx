import axios from 'axios';
import { apiAccessUrl } from './almTypes';

const getDescFromID = async (id: number, token: string):Promise<string> => {
    try{
        const url = `${apiAccessUrl}workitem?fields=workitem/workItem[id=${id}]/summary`
        const response = await axios.post(
        url, 
        null, 
        {
            headers: {
            'Authorization': token
            }
        });
        return response.data;
    } catch (error) {
        console.error('Fetch failed:', error);
        return "Error fetching description";
    }
};

const convertToDate = (dateString: string): Date => {
    return new Date(dateString);
}

export { getDescFromID, convertToDate };