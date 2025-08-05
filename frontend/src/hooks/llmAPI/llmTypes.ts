import { apiBaseUrl } from "../almAPI/almTypes"

type chatGPTResponse = {
    choices: chatGPTChoice[],
    created: number, //ms time
    id: string,
    model: string,
    object: string,
    prompt_filter_results: chatGPTFilterResult[],
    system_fingerprint: string,
    usage: chatGPTUsage,
}

type chatGPTChoice = {
    content_filter_results: chatGPTFilterResult,
    finish_reason: string,
    message: chatGPTMessage,
}

type chatGPTFilterResult = {
    hate: chatGPTFilterDetail,
    self_harm: chatGPTFilterDetail,
    sexual: chatGPTFilterDetail,
    violence: chatGPTFilterDetail,
}

type chatGPTFilterDetail = {
    filtered: boolean,
    severity: string
}

type chatGPTUsage = {
    completion_tokens: number,
    completion_tokens_details: {
        accepted_prediction_tokens: number,
        audio_tokens: number,
        reasoning_tokens: number,
        rejected_prediction_tokens: number,
    },
    prompt_tokens: number,
    prompt_token_details: {
        audio_tokens: number,
        cached_tokens: number,
    },
    total_tokens: number
}

type chatGPTMessage = {
    annotations: [],
    content: string,
    refusal: string | null,
    role: string,
}

const apiAIUrl = apiBaseUrl + "/ai";

export type {chatGPTResponse}
export { apiAIUrl }