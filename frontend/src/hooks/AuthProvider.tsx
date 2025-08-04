import { useContext, createContext, useState } from "react";
import { apiLogin, apiTokenCheck, type loginCredentials } from "../almAPI/almAuth";
import { useNavigate } from "react-router";
interface AuthContextType {
  // Define the shape of your context value here
  user: string;
  token: string;
  login: (credentials: loginCredentials) => Promise<number>;
  logout: () => void;
  validateLogin: () => Promise<boolean>;
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
            } else if (res?.status == 401) {
                navigate("/login")
            }
            return res?.status ?? 404
        },
        logout: () => {
            setUser("")
            setToken("")
            localStorage.removeItem("site");
            console.log("Logged out.")
            navigate("/login")
        },
        validateLogin: async () => {
          const res = await apiTokenCheck(token);
          if (res?.status == 200) {
                authValue.user = res?.data.user
                return true
            } else if (res?.status == 401) {
                localStorage.removeItem("site");
                return false
            } else {
              return false
            }
        }
    };

  return <AuthContext.Provider value={authValue}>{children}</AuthContext.Provider>;
};

export default AuthProvider;

export const useAuth = () => {
  return useContext(AuthContext);
};