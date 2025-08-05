import { XMLParser } from "fast-xml-parser";
import type { apiWorkItem, apiQuery } from "./almAPI/almTypes";

const convertIsoStringToDate = (dateString: string): Date => {
    return new Date(dateString);
}

const xmlToJObj = (xml: string) => {
    const parser = new XMLParser();
    const jObj = parser.parse(xml)
    return jObj
}

const getWorkItemDetails = (xml: string):apiWorkItem => {
    const jObj: apiWorkItem = xmlToJObj(xml).workitem
    return jObj
}

const getQueryDetails = (xml:string):apiQuery => {
    const colonless = xml.replace(/:/g, '')
    const jObj: apiQuery = xmlToJObj(colonless).oslc_cmCollection
    return jObj
}

export { convertIsoStringToDate, getWorkItemDetails, getQueryDetails, xmlToJObj }