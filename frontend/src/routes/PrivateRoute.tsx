import { useState, useEffect } from "react";
import { Navigate, Outlet } from "react-router";
import { useAuth } from "../hooks/AuthProvider";

const PrivateRoute = () => {
    const [isAuthenticated, setAuthenticated] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);
    const auth = useAuth();

    useEffect(()=>{
        if (auth?.token === ""){
            setAuthenticated(false);
            setLoading(false);
        } else {
            auth?.validateLogin().then(result=>{
                if (result){
                    setAuthenticated(true)
                    setLoading(false)
                } else {
                    setAuthenticated(false)
                    setLoading(false)
                }
            })
        }
    }, [loading])
    
    if (loading) return <h1>Loading...</h1>

    if (isAuthenticated) return <Outlet/>
    return <Navigate to="/login" />;
}
export default PrivateRoute;