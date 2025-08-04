import axios from 'axios';
import { apiWorkItemUrl, apiQueryUrl } from './almTypes';
import type {apiResponse, almWorkItem, almExtension}  from './almTypes';
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

const getFormattedDescription = async (id: number, token: string):Promise<Pick<almWorkItem, "id" | "formattedDescription">> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|formattedDescription)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem!
        return {id: workItem.id ?? -1, formattedDescription: workItem.formattedDescription ?? ""};
    } catch {
        return {id: -1, formattedDescription: ""};
    };
};

const getParentId = async (id: number, token: string):Promise<Pick<almWorkItem, "id"> & {parent?: Pick<almWorkItem, "id">}> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|parent/id)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem!
        return {id: workItem.id ?? -1, parent: workItem.parent ?? undefined};
    } catch {
        return {id: -1, parent: undefined};
    }
};

const getSummaryAnalysis = async (id: number, token: string):Promise<Pick<almWorkItem, "id"> & {summaryAnalysis: almExtension["largeStringValue"]}> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|allExtensions[key=com.bosch.ae.be.team.workitem.attribute.summary_analysis]/largeStringValue)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem!
        return {id: workItem.id ?? -1, summaryAnalysis: (workItem.allExtensions && "largeStringValue" in workItem.allExtensions) ? workItem.allExtensions.largeStringValue : ""}
    } catch {
        return {id: -1, summaryAnalysis: ""}
    }
};


export { getOverviewFromID, getIDsFromQuery, getFormattedDescription, getParentId, getSummaryAnalysis };