import { useContext, createContext, useState } from "react";
import apiLogin, { type loginCredentials } from "../almAPI/almAuth";
import { useNavigate } from "react-router";
interface AuthContextType {
  // Define the shape of your context value here
  user: string;
  token: string;
  login: (credentials: loginCredentials) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: React.ReactNode;
}

const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<string>("");
    const [token, setToken] = useState<string>(localStorage.getItem("site") || "")
    const navigate = useNavigate()
    const authValue: AuthContextType = {
        user: user,
        token: token,
        login: async (credentials) => {
            const res = await apiLogin(credentials);
            if (res?.status == 200) {
                setUser(credentials.username)
                setToken(res.data.token)
                localStorage.setItem("site", res.data.token)
                console.log(`Logged in as ${credentials.username}`)
                navigate("/dashboard")
            }
        },
        logout: () => {
            setUser("")
            setToken("")
            localStorage.removeItem("site");
            console.log("Logged out.")
            navigate("/login")
        },
    };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};