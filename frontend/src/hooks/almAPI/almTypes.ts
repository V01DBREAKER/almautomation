type apiResponse = {
    user: string | undefined,
    api: string,
    error: string | undefined
} 

type almWorkItem = {
    id: number;
    uniqueId: string;
    reportableUrl: string;              // url to workitem (not useful)
    itemType: string;                   // work item type
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    predecessor: string;                // seems to be predecessor state?
    resolutionDate: string;
    summary: string;                    // title/summary of work item
    creationDate: string;
    dueDate: Date;
    description: string;                // description of work item
    // workflowSurrogate: almWorkFlow;   
    tags: string[] | string;                     // tags of work item separated by |
    duration: number;                   // -1 for undefined
    timeSpent: number;                  // -1 for undefined
    correctedEstimate: number;          // -1 for undefined
    modifiedBy: almUser;
    creator: almUser;
    owner: almUser;
    category: almCategory;
    comments: almComment[];
    customAttributes: almCustomAttr[] | almCustomAttr;  // There are multiple custom attribute child tags
    subscriptions: almUser[] | almUser;           // There are multiple subscriptions child tags
    projectArea: almProject;
    resolver: almUser;
    target: almIteration;
    foundIn: almDeliverable;
    itemExtensions: [];
    stateTransitions: [];
    // multiple types of extensions use allExtensions.type instead
    itemHistory: [];
    auditableLinks: almAttachment[] | almAttachment;
    teamArea: almTeamArea;
    dayModified: string;
    commentCount: number;
    subscriberCount: number;
    state: almState;
    type: {
        id: string;
        name: string;
    };
    severity: {
        id: string;
        name: string;
    };
    priority: {
        id: string;
        name: string;
    };
    parent: almWorkItem | undefined;
    children: almWorkItem[] | almWorkItem;
    allExtensions: almExtension[] | almExtension;
    formattedSummary: string;
    formattedDescription: string;
    // <stringComplexity/>
    // <integerComplexity/>
    // <floatComplexity/>
    // <longComplexity/>
    // <doubleComplexity/>
    activationDate: string;
    plannedStartDate: string; 
    plannedEndDate: string;
}

type almUser = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    emailAddress: string;
    userId: string;
    name: string;
    archived: boolean;
    modifiedBy: string;
};

type almCategory = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    name: string;
    description: string;
    id: string;
    archived: boolean;
    readAccessEnabled: boolean;
    modifiedBy: string;
    teamAreas: string[] | string;
    projectArea: string;
    defaultTeamArea: string;
    qualifiedName: string;
};

type almComment = {
    helperId: string;
    creationDate: string;
    content: string;
    edited: boolean;
    creator: almUser;
    formattedContent: string;
};

type almCustomAttr = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    identifier: string;
    attributeType: string;
    builtIn: boolean;
    modifiedBy: string;
    projectArea: string;
};

type almProject = {
    uniqueId:string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    archived: boolean;
    modifiedBy: almUser;
    states: [];
    resolutions: [];
    workItemTypes: [];
    workItemTypeMappings: [];
    enumerations: [];
    approvalStates: [];
    extensionMetadata: [];
};

type almIteration = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    name: string;
    id: string;
    archived: boolean;
    startDate: string;
    endDate: string;
    hasDeliverable: boolean;
    modifiedBy: string;
    parent: string;
    children: string[] | string;
    developmentLine: string;
    iterationType: string;
};

type almDeliverable = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    name: string;
    description: string;
    archived: boolean;
    creationDate: string;
    modifiedBy: string;
    projectArea: string;
    artifact: string;
};

type almAttachment = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    name: string;
    archived: boolean;
    modifiedBy: string;
    sourceRef: string;
    targetRef: string;
};

type almTeamArea = {
    uniqueId: string;
    reportableUrl: string;
    itemType: string;
    stateId: string;
    itemId: string;
    contextId: string;
    modified: string;
    archived: boolean;
    name: string;
    modifiedBy: string;
}

type almState = {
    id: string;
    name: string;
    workflow: almWorkFlow;
}

type almWorkFlow = {};

type almExtension = {
    helperId: string;
    key: string;
    type: string;
    booleanValue: boolean;
    integerValue: number;
    longValue: number;
    doubleValue: number;
    smallStringValue: string;
    displayName: string;
    displayValue: string;
    mediumStringValue: string;
    largeStringValue: string;
    timestampValue: string;
    decimalValue: number;
}

type almQueryItem = {
    dcidentifier: number
    //add the rest from https://rb-alm-14-p.de.bosch.com/ccm/oslc/queries/_FBmkkNTZEe2dMeAfmKsDsQ/rtc_cm:results
}

interface apiWorkItem {
    workItem: Partial<almWorkItem>
}

interface apiWorkItems {
    workItem: Partial<almWorkItem>[]
}

interface apiQuery {
    oslc_cmChangeRequest: [Partial<almQueryItem>]
}

const almTypeIds = {problem: "com.bosch.rtc.configuration.workitemtype.type.problem"};

const apiBaseUrl = `/api`;
const apiAccessUrl = apiBaseUrl + "/alm";
const apiLoginUrl = apiBaseUrl + "/login";
const apiWorkItemUrl = apiAccessUrl + "/rpt/repository/workitem?fields=workitem";
const apiQueryUrl = apiAccessUrl + "/oslc/queries";

const almWorkItemUrl = "https://rb-alm-14-p.de.bosch.com/ccm/resource/itemName/com.ibm.team.workitem.WorkItem"
const almQueryUrl = "https://rb-alm-14-p.de.bosch.com/ccm/resource/itemOid/com.ibm.team.workitem.query.QueryDescriptor";


export type {almWorkItem, almUser, almCategory, almComment, almCustomAttr, almProject, almIteration, almDeliverable, almAttachment, almTeamArea, almState, almExtension}
export {almTypeIds}
export type {apiResponse, apiWorkItem, apiQuery, apiWorkItems}
export {apiAccessUrl, apiLoginUrl, apiWorkItemUrl, apiQueryUrl, almWorkItemUrl, almQueryUrl, apiBaseUrl}