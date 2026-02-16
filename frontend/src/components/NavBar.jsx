import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "./../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import axios from 'axios';
import { toast } from 'react-toastify';

const NavBar = () => {

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const { userData, isLoggedIn, backendUrl, setUserData, setIsLoggedIn } = useContext(AppContext);

  console.log("Navbar userData:", userData);
  console.log("Navbar isLoggedIn:", isLoggedIn);


  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + '/api/auth/logout');
      data.success && setIsLoggedIn(false);
      data.success && setUserData(null);
      navigate('/')
    } catch (error) {
      toast.error(error.message)
    }
  }

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow-md">

      {/* Left Section */}
      <div className="flex items-center gap-2">
        <img src={assets.Logo} alt="logo" className="w-8 cursor-pointer" onClick={() => navigate("/")} />
        <span className="text-xl font-bold text-gray-800 cursor-pointer" onClick={() => navigate("/")}>TaskFlow</span>
      </div>

      {/* Center Menu */}
      <div className="hidden md:flex items-center gap-6">
        <button
          onClick={() => navigate("/dashboard")}
          className={`text-xl px-4 py-2 rounded-lg cursor-pointer transition-colors ${location.pathname === '/dashboard' ? 'bg-teal-400 text-white' : 'text-gray-600 hover:text-black'}`}
        >
          Dashboard
        </button>
        <button
          onClick={() => navigate("/my-tasks")}
          className={`text-xl px-4 py-2 rounded-lg cursor-pointer transition-colors ${location.pathname === '/my-tasks' ? 'bg-teal-400 text-white' : 'text-gray-600 hover:text-black'}`}
        >
          My Tasks
        </button>
        <button className="text-xl text-gray-600 hover:text-black cursor-pointer">AI Planner</button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">

        {isLoggedIn && (
          <button onClick={() => navigate("/create-task")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">
            + New Task
          </button>
        )}

        {isLoggedIn && userData ? (
          <div className="relative flex items-center gap-3" ref={menuRef}>
            <div className="text-right hidden sm:block">
              <p className="text-xl font-medium text-sm">{userData.fullName}</p>
              <p className="text-sm text-gray-500">
                {userData.email}
              </p>
            </div>

            {/* Avatar */}
            <div
              onClick={() => setOpen(!open)}
              className="text-xl w-10 h-10 flex items-center justify-center bg-red-400 text-white rounded-full font-semibold hover:bg-red-500 cursor-pointer"
            >
              {userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "U"}
            </div>

            {/* Dropdown */}
            {open && (
              <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 animate-fadeIn">
                <button
                  className="text-xl flex items-center gap-2 text-red-400 font-semibold hover:bg-gray-100 w-full px-3 py-2 rounded-lg"
                  onClick={logout}
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <>
            <button onClick={() => navigate("/login")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">Login</button>
            <button onClick={() => navigate("/register")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">Register</button>
          </>
        )}

      </div>
    </div>
  );
};

export default NavBar;
