import { apiLoginUrl, apiAccessUrl } from "./almTypes";
import axios, {type AxiosResponse} from "axios";

type loginCredentials = {
    username: string,
    password: string
}

const apiLogin = async (credentials: loginCredentials):Promise<AxiosResponse | undefined> => {
    try {
        const response = await axios.post(
        apiLoginUrl, 
        { 
            username:credentials.username, 
            password:credentials.password 
        }
        );
        return response
    } catch (error) {
        console.error('Login failed:', error);
    }
};

const apiTokenCheck = async (token:string):Promise<AxiosResponse | undefined> => {
    try {
        const response = await axios.post(
        apiAccessUrl, 
        null, 
        {
            headers: {
            'Authorization': token
            }
        });
        return response
    } catch (error) {
        console.error('Login failed:', error);
    }
}

export {apiLogin, apiTokenCheck};
export type { loginCredentials };