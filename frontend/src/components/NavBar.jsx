import React from "react";
import { assets } from "./../assets/assets";
import { useNavigate } from "react-router-dom";
import { useState, useRef, useEffect } from "react";

const NavBar = () => {

  const [open, setOpen] = useState(false);
  const menuRef = useRef();

  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e) => {
      if (!menuRef.current.contains(e.target)) {
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
        <button className="text-xl px-4 py-2 bg-teal-400 text-white rounded-lg cursor-pointer">
          Dashboard
        </button>
        <button className="text-xl text-gray-600 hover:text-black cursor-pointer">My Tasks</button>
        <button className="text-xl text-gray-600 hover:text-black cursor-pointer">AI Planner</button>
      </div>

      {/* Right Section */}
      <div className="flex items-center gap-6">
        <button onClick={() => navigate("/login")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">Login</button>
        <button onClick={() => navigate("/register")} className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">Register</button>
        <button className="text-xl px-4 py-2 bg-red-400 text-white rounded-lg hover:bg-red-500 cursor-pointer">
          + New Task
        </button>

        <div className="relative flex items-center gap-3" ref={menuRef}>
  <div className="text-right hidden sm:block">
    <p className="font-medium text-sm">kaveeshassewmini161</p>
    <p className="text-xs text-gray-500">
      kaveeshassewmini161@gmail.com
    </p>
  </div>

  {/* Avatar */}
  <div
    onClick={() => setOpen(!open)}
    className="text-xl w-10 h-10 flex items-center justify-center bg-red-400 text-white rounded-full font-semibold hover:bg-red-500 cursor-pointer"
  >
    KA
  </div>

  {/* Dropdown */}
  {open && (
    <div className="absolute right-0 top-12 w-48 bg-white rounded-2xl shadow-xl border border-gray-100 p-3 animate-fadeIn">
      <button
        className="text-xl flex items-center gap-2 text-red-400 font-semibold hover:bg-gray-100 w-full px-3 py-2 rounded-lg"
        onClick={() => console.log("Sign out")}
      >
        Sign Out
      </button>
    </div>
  )}
</div>

      </div>
    </div>
  );
};

export default NavBar;
