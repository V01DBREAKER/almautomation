import { apiLoginUrl } from "./almTypes";
import axios from "axios";

type loginCredentials = {
    username: string,
    password: string
}

const apiLogin = async (credentials: loginCredentials) => {
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

export default apiLogin;
export type { loginCredentials };