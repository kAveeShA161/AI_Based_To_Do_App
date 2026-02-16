import NavBar from '../components/NavBar'
import React, { useState, useContext } from "react";
import { assets } from "./../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const Login = () => {
  const navigate = useNavigate();
  const { backendUrl, getUserData } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [error, setError] = useState("");

  const onSubmitHandler = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/login`,
        { email, password },
        { withCredentials: true }
      );

      if (res.data.success) {
        await getUserData();
        toast.success("Logged in successfully!");
        navigate("/");
        return;
      }

      toast.error(res.data.message);
    } catch (err) {
      console.error("Login error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred during login. Please try again.";

      toast.error(msg);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Top Logo Circle */}
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <img src={assets.Logo} alt="logo" className="w-20" />
        </div>

        {/* Header */}
        <h1 className="mt-6 text-4xl font-bold text-gray-900">Welcome back</h1>
        <p className="text-xl mt-2 text-gray-500 text-base">
          Sign in to your TaskFlow account
        </p>

        {/* Card */}
        <div className="mt-10 w-full bg-white rounded-2xl shadow-md border border-gray-100 px-10 py-10">

          <form onSubmit={onSubmitHandler} className="space-y-7">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-xl font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                value={email}
                className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xl font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                onChange={e => setPassword(e.target.value)}
                value={password}
                placeholder="••••••••"
                className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-xl text-red-400 hover:text-red-500 cursor-pointer"
                  onClick={() => {
                    navigate("/password-reset")
                    console.log("Forgot password clicked")
                  }}
                >
                  Forgot password?
                </button>
              </div>
            </div>

            {/* Sign in button */}
            <button
              type="submit"
              className="text-xl w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 rounded-lg transition cursor-pointer"
            >
              Sign in
            </button>

            {/* Bottom text */}
            <p className="text-xl text-center text-sm text-gray-500">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="text-xl text-red-400 hover:text-red-500 font-medium cursor-pointer"
                onClick={() => {
                  navigate("/register");
                  console.log("Sign up clicked");
                }}
              >
                Sign up
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
