import { ProxyAgent, Agent, fetch } from 'undici';

const requestALM = async (url: string, auth: string): Promise<[number, string]> => {
    try {
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json', // Ensure proper headers
                'Accept': 'application/xml', // Request XML response
                'Authorization': auth,
            },
            // Use undici's fetch with custom agent
            // dispatcher: new Agent({
            //     connect: { rejectUnauthorized: false } // Ignore self-signed certificate
            // })
        });

        const responseBody = await response.text(); // Fetch response body as text
        return [response.status, responseBody];
    } catch (error) {
        console.error('Error:', error);
        return [500, String(error)];
    }
};

const requestLLM = async (url:string, context:string, prompt:string):Promise<[number, string]> => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
            'Content-Type': 'application/json',
            'genaiplatform-farm-subscription-key': process.env.LLM_API_KEY
            },
            body: JSON.stringify({
            messages: [
                { role: 'system', content: context },
                { role: 'user', content: [{ type: 'text', text: prompt }] }
            ],
            max_tokens: 4096,
            stream: false
            }),
            dispatcher: new ProxyAgent({ uri: 'http://127.0.0.1:3128' })
        });

        const responseBody = await response.text(); // Fetch response body as text
        return [response.status, responseBody];
    } catch (error) {
        console.error('Error:', error);
        return [500, String(error)];
    }
};

const convertAuthBasic = (username:string, password: string) => 'Basic ' + Buffer.from(`${username}:${password}`).toString('base64');

export { requestALM, requestLLM, convertAuthBasic }