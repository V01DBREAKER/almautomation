type almWorkItem = {
    id: number;
    uniqueId: string;
    reportableUrl: string;              // url to workitem (not useful)
    itemType: string;                   // work item type
    stateId: string;
    itemId: string;
    contextId: string;
    modified: Date;
    predecessor: string;                // seems to be predecessor state?
    resolutionDate: Date;
    summary: string;                    // title/summary of work item
    creationDate: Date;
    dueDate: Date | null;
    description: string;                // description of work item
    // workflowSurrogate: almWorkFlow | null;   
    tags: string[];                     // tags of work item separated by |
    duration: number;                   // -1 for undefined
    timeSpent: number;                  // -1 for undefined
    correctedEstimate: number;          // -1 for undefined
    modifiedBy: almUser;
    creator: almUser;
    owner: almUser;
    category: almCategory;
    comments: almComment[];
    customAttributes: almCustomAttr[];  // There are multiple custom attribute child tags
    subscriptions: almUser[];           // There are multiple subscriptions child tags
    projectArea: almProject;
    resolver: almUser;
    target: almIteration;
    foundIn: almDeliverable;
    itemExtensions: [];
    stateTransitions: [];
    // multiple types of extensions use allExtensions.type instead
    itemHistory: [];
    auditableLinks: almAttachment[];
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
    parent: almWorkItem;
    children: almWorkItem[];
    allExtensions: almExtension[];
    formattedSummary: string;
    formattedDescription: string;
    // <stringComplexity/>
    // <integerComplexity/>
    // <floatComplexity/>
    // <longComplexity/>
    // <doubleComplexity/>
    activationDate: Date;
    plannedStartDate: Date; 
    plannedEndDate: Date;
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
    modifiedBy: string | null;
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
    description: string | null;
    id: string;
    archived: boolean;
    readAccessEnabled: boolean;
    modifiedBy: string | null;
    teamAreas: string[] | null;
    projectArea: string | null;
    defaultTeamArea: string | null;
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
    modifiedBy: string | null;
    projectArea: string | null;
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
    modifiedBy: string | null;
    parent: string | null;
    children: string[] | null;
    developmentLine: string | null;
    iterationType: string | null;
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
    creationDate: string | null;
    modifiedBy: string | null;
    projectArea: string | null;
    artifact: string | null;
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
    modifiedBy: string | null;
    sourceRef: string | null;
    targetRef: string | null;
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
    modifiedBy: string | null;
}

type almState = {
    id: string;
    name: string;
    workflow: almWorkFlow | null;
}

type almWorkFlow = {};

type almExtension = {
    helperId: string | null;
    key: string;
    type: string;
    booleanValue: boolean | null;
    integerValue: number | null;
    longValue: number | null;
    doubleValue: number | null;
    smallStringValue: string | null;
    displayName: string;
    displayValue: boolean;
    mediumStringValue: string | null;
    largeStringValue: string | null;
    timestampValue: string | null;
    decimalValue: number | null;
}

interface apiWorkItem {
    workItem: Partial<almWorkItem>
}

export type {almWorkItem, almUser, almCategory, almComment, almCustomAttr, almProject, almIteration, almDeliverable, almAttachment, almTeamArea, almState}
export type {apiWorkItem}