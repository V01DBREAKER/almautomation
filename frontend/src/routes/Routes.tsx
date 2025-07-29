import { Routes, Route } from "react-router";
import PrivateRoute from "./PrivateRoute";
import Login from "../views/Login";
import Dashboard from "../views/Dashboard";


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/login" element={<Login/>}/>
            <Route path="/" element={<PrivateRoute/>}> 
                <Route path="/dashboard" element={<Dashboard/>}/>
            </Route>
            <Route path="*" element={<Login/>}/>
        </Routes>
    );
};

export default AppRoutes;