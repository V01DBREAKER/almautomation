import axios from "axios";
import { apiAIUrl, type chatGPTResponse } from "./llmTypes";

const requestAI = async (url:string, context:string, prompt:string, token:string) => {
    try{
        const response = await axios.post(
            url, 
            {
                context: context,
                prompt: prompt
            }, 
            {
                headers: {
                'Authorization': token
                }
            }
        );
        const res = response.data;
        if (res.error) throw res.error;
        return res;
    } catch (error) {
        console.error('Fetch failed:', error);
        return error;
    }
};

const askChat4omini = async (context: string, prompt: string, token:string):Promise<chatGPTResponse>=>{
    const url = apiAIUrl + '/askbosch-prod-farm-openai-gpt-4o-mini-2024-07-18/chat/completions?api-version=2024-08-01-preview'
    const apiResponse = await requestAI(url, context, prompt, token);
    console.log(apiResponse)
    const apiObj = JSON.parse(apiResponse.api)
    return apiObj
}

const askGemini2oFlash = async (context: string, prompt: string, token:string):Promise<string>=>{
    const url =  apiAIUrl + '/askbosch-prod-farm-google-gemini-2-0-flash-2025-04-01/chat/completions?api-version=2025-04-01-preview'
    return "google gemini not implemented yet"
}

export {askChat4omini, askGemini2oFlash}