import React, { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";

const Home = () => {
    const { isLoggedIn } = useContext(AppContext);

    return <Navigate to={isLoggedIn ? "/dashboard" : "/login"} replace />;
};

export default Home;
