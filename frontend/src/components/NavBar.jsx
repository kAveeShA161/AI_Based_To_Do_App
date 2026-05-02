import React, { useContext, useState, useRef, useEffect } from "react";
import { AppContext } from "../context/AppContext";
import { assets } from "./../assets/assets";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";

const NavBar = () => {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);

  const menuRef = useRef();

  const { userData, isLoggedIn, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

  const navigate = useNavigate();
  const location = useLocation();

  const logout = async () => {
    try {
      axios.defaults.withCredentials = true;
      const { data } = await axios.post(backendUrl + "/api/auth/logout");
      if (data.success) {
        setIsLoggedIn(false);
        setUserData(null);
        setOpen(false);
        setMobileMenu(false);
        navigate("/login");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const NavButton = ({ path, label }) => (
    <button
      onClick={() => {
        navigate(path);
        setMobileMenu(false);
      }}
      className={`text-lg px-4 py-2 rounded-lg transition-colors w-full md:w-auto text-left md:text-center ${
        location.pathname === path
          ? "bg-teal-400 text-white"
          : "text-gray-600 hover:text-black"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="flex items-center justify-between px-6 py-3 bg-white shadow-md relative">

      {/* Left */}
      <div className="flex items-center gap-2">
        <img
          src={assets.Logo}
          alt="logo"
          className="w-8 cursor-pointer"
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
        />
        <span
          className="text-xl font-bold text-gray-800 cursor-pointer"
          onClick={() => navigate(isLoggedIn ? "/dashboard" : "/login")}
        >
          TaskFlow
        </span>
      </div>

      {/* Desktop Menu */}
      <div className="hidden md:flex items-center gap-6">
        <NavButton path="/dashboard" label="Dashboard" />
        <NavButton path="/my-tasks" label="My Tasks" />
        <NavButton path="/ai-planner" label="AI Planner" />
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-4">

        {isLoggedIn && (
          <button
            onClick={() => navigate("/create-task")}
            className="text-lg px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer hidden sm:block"
          >
            + New Task
          </button>
        )}

        {/* Mobile Hamburger */}
        <button
          className="md:hidden text-2xl"
          onClick={() => setMobileMenu(!mobileMenu)}
        >
          ☰
        </button>

        {/* User Section */}
        {isLoggedIn && userData ? (
          <div className="relative flex items-center gap-3" ref={menuRef}>
            <div className="hidden sm:block text-right">
              <p className="text-lg font-semibold text-gray-900">{userData.fullName}</p>
              <p className="text-sm text-gray-500">{userData.email}</p>
            </div>

            <button
              type="button"
              onClick={() => setOpen(!open)}
              className="flex h-10 w-10 items-center justify-center rounded-full bg-red-400 text-sm font-semibold leading-none tracking-tight text-white cursor-pointer transition-transform hover:scale-105 sm:text-base"
            >
              {userData.fullName
                ? userData.fullName.slice(0, 2).toUpperCase()
                : "U"}
            </button>

            {open && (
              <div className="absolute right-0 top-14 z-50 w-64 overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                <div className="border-b border-gray-100 px-4 py-3">
                  <p className="text-sm font-semibold text-gray-900">{userData.fullName}</p>
                  <p className="mt-1 truncate text-xs text-gray-500">{userData.email}</p>
                </div>

                <div className="p-2">
                  <button
                    className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                    onClick={logout}
                  >
                    <i className="fa-solid fa-right-from-bracket text-base" aria-hidden="true"></i>
                    <span>Sign Out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => navigate("/login")}
              className="px-4 py-2 bg-red-400 text-white rounded-lg"
            >
              Login
            </button>
            <button
              onClick={() => navigate("/register")}
              className="px-4 py-2 bg-red-400 text-white rounded-lg"
            >
              Register
            </button>
          </div>
        )}
      </div>

      {/* Mobile Menu */}
      {mobileMenu && (
        <div className="absolute top-16 left-0 w-full bg-white shadow-md md:hidden flex flex-col gap-2 p-4 z-50">
          <NavButton path="/dashboard" label="Dashboard" />
          <NavButton path="/my-tasks" label="My Tasks" />
          <NavButton path="/ai-planner" label="AI Planner" />

          {isLoggedIn ? (
            <>
              <button
                onClick={() => {
                  navigate("/create-task");
                  setMobileMenu(false);
                }}
                className="text-lg px-4 py-2 bg-red-400 text-white rounded-lg"
              >
                + New Task
              </button>

              <button
                onClick={logout}
                className="text-lg px-4 py-2 text-red-500 font-semibold"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  navigate("/login");
                  setMobileMenu(false);
                }}
                className="px-4 py-2 bg-red-400 text-white rounded-lg"
              >
                Login
              </button>

              <button
                onClick={() => {
                  navigate("/register");
                  setMobileMenu(false);
                }}
                className="px-4 py-2 bg-red-400 text-white rounded-lg"
              >
                Register
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default NavBar;
