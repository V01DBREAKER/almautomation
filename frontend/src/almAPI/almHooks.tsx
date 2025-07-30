import axios from 'axios';
import { apiWorkItemUrl, apiQueryUrl } from './almTypes';

const requestAPI = async (url: string, token: string):Promise<string> => {
    try{
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

const getDescFromID = async (id: number, token: string):Promise<string> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|summary|formattedDescription)`;
    return await requestAPI(url, token);
};

const getIDsFromQuery = async (queryId: string, token: string):Promise<string> => {
    const url = `${apiQueryUrl}/${queryId}/rtc_cm:results?oslc_cm.properties=dc:identifier`;
    return await requestAPI(url, token);
};

export { getDescFromID, getIDsFromQuery };