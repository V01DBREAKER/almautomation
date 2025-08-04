import axios from 'axios';
import { type apiResponse, apiWorkItemUrl, apiQueryUrl, type almWorkItem } from './almTypes';
import { getWorkItemDetails, getQueryDetails } from '../hooks/ParsingTools'


const requestAPI = async (url: string, token: string):Promise<apiResponse> => {
    try{
        const response = await axios.post(
        url, 
        null, 
        {
            headers: {
            'Authorization': token
            }
        });
        const res = response.data as apiResponse;
        if (res.error) throw res.error;
        return res;
    } catch (error) {
        console.error('Fetch failed:', error);
        const res:apiResponse = {
            user: undefined,
            api: "Error in API response.",
            error: error as string
        }
        return res;
    }
};

const getOverviewFromID = async (id: number, token: string): Promise<Pick<almWorkItem, "id" | "formattedSummary" | "formattedDescription">> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|formattedSummary|formattedDescription)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem;
        return {
            id: workItem.id ?? -1,
            formattedSummary: workItem.formattedSummary ?? "",
            formattedDescription: workItem.formattedDescription ?? "",
        };
    } catch {
        return {id: -1, formattedSummary: "", formattedDescription: ""};
    };
};

const getIDsFromQuery = async (queryId: string, token: string):Promise<number[]> => {
    const url = `${apiQueryUrl}/${queryId}/rtc_cm:results?oslc_cm.properties=dc:identifier`;
    try {
        const res = await requestAPI(url, token)
        return getQueryDetails(res.api).oslc_cmChangeRequest?.map(el=>Number(el.dcidentifier)) ?? [];
    } catch {
        return []
    }
};

const getFormattedDescription = async (id: number, token: string):Promise<string> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/formattedDescription`;
    const res = await requestAPI(url, token);
    return getWorkItemDetails(res.api).workItem?.formattedDescription ?? res.api;
};

const getParentId = async (id: number, token: string):Promise<number> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/parent/id`;
    const res = await requestAPI(url, token);
    return getWorkItemDetails(res.api).workItem?.parent?.id ?? -1;
};

const getSummaryAnalysis = async (id: number, token: string):Promise<string> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/allExtensions[key=com.bosch.ae.be.team.workitem.attribute.summary_analysis]/largeStringValue`;
    const res = await requestAPI(url, token);
    const extensions = getWorkItemDetails(res.api).workItem?.allExtensions
    console.log(extensions)
    return (extensions && extensions[0].largeStringValue) ?? "";
};


export { getOverviewFromID, getIDsFromQuery, getFormattedDescription, getParentId, getSummaryAnalysis };