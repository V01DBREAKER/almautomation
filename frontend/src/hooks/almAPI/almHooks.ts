import axios from 'axios';
import { apiWorkItemUrl, apiQueryUrl } from './almTypes';
import type {apiResponse, almWorkItem, almExtension}  from './almTypes';
import { getWorkItemDetails, getWorkItemsDetails, getQueryDetails } from '../ParsingTools'


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

const getFormattedSummary = async (id: number, token: string): Promise<Pick<almWorkItem, "id" | "formattedSummary">> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|formattedSummary)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem;
        return {
            id: workItem.id ?? -1,
            formattedSummary: workItem.formattedSummary ?? "",
        };
    } catch {
        return {id: -1, formattedSummary: ""};
    };
};

const getManyFormattedSummary = async (ids: number[], token: string): Promise<Pick<almWorkItem, "id" | "formattedSummary">[]> => {
    const idSection = ids.reduce((acc, id)=>acc+`id=${id} or `, '')
    const url = `${apiWorkItemUrl}/workItem[${idSection.slice(0, -4)}]/(id|formattedSummary)`;
    try {
        const res = await requestAPI(url, token);
        const workItems = getWorkItemsDetails(res.api).workItem
        const result = workItems.map(workItem=>({
            id: workItem.id ?? -1,
            formattedSummary: workItem.formattedSummary ?? "",
        }))
        return result
    } catch {
        return [{id: -1, formattedSummary: ""}];
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

const getType = async (id:number, token:string):Promise<Pick<almWorkItem, "id" | "type">> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|type/*)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem!
        return {id: workItem.id ?? -1, type: workItem.type ?? {id: "type not found", name: "type not found"}};
    } catch (error) {
        return {id: -1, type: {id: String(error), name: String(error)}};
    }
}

const getManyType = async (ids:number[], token:string):Promise<Pick<almWorkItem, "id" | "type">[]> => {
    const idSection = ids.reduce((acc, id)=>acc+`id=${id} or `, '').slice(0, -4)
    const url = `${apiWorkItemUrl}/workItem[${idSection}]/(id|type/*)`;
    try {
        const res = await requestAPI(url, token);
        const workItems = getWorkItemsDetails(res.api).workItem;
        const results = workItems.map(workItem=>({id: workItem.id ?? -1, type: workItem.type ?? {id: "type not found", name: "type not found"}}));
        return results;
    } catch (error) {
        return [{id: -1, type: {id: String(error), name: String(error)}}];
    }
}


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

const getProblemAnalysisSummary = async (id: number, token: string):Promise<Pick<almWorkItem, "id"> & {description: almExtension["largeStringValue"]}> => {
    const url = `${apiWorkItemUrl}/workItem[id=${id}]/(id|allExtensions[key=com.bosch.ae.be.team.workitem.attribute.ProblemAnalysisSummary]/largeStringValue)`;
    try {
        const res = await requestAPI(url, token);
        const workItem = getWorkItemDetails(res.api).workItem!
        return {id: workItem.id ?? -1, description: (workItem.allExtensions && "largeStringValue" in workItem.allExtensions) ? workItem.allExtensions.largeStringValue : ""}
    } catch {
        return {id: -1, description: ""}
    }
};

const getManyProblemTicket = async (ids: number[], token: string):Promise<(Pick<almWorkItem, "id" | "formattedSummary"> & {description: almExtension["largeStringValue"]})[]> => {
    const idSection = ids.reduce((acc, id)=>acc+`id=${id} or `, '').slice(0, -4)
    const url = `${apiWorkItemUrl}/workItem[${idSection}]/(id|formattedSummary|allExtensions[key=com.bosch.ae.be.team.workitem.attribute.ProblemAnalysisSummary]/largeStringValue)`;
    try {
        const res = await requestAPI(url, token);
        const workItems = getWorkItemsDetails(res.api).workItem
        const result = workItems.map(workItem =>
            ({id: workItem.id ?? -1, formattedSummary: workItem.formattedSummary ?? "", description: (workItem.allExtensions && "largeStringValue" in workItem.allExtensions) ? workItem.allExtensions.largeStringValue : ""}))
        return result
    } catch {
        return [{id: -1, formattedSummary: "", description: ""}]
    }
};


export { getOverviewFromID, getIDsFromQuery, getFormattedSummary, getFormattedDescription, getParentId, getSummaryAnalysis, getType, getManyType, getProblemAnalysisSummary, getManyProblemTicket };