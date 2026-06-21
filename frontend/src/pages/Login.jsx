import NavBar from '../components/NavBar'
import React, { useState, useContext } from "react";
import { assets } from "./../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';
import PasswordInput from '../components/PasswordInput';

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
        <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:mt-6 sm:text-4xl">Welcome back</h1>
        <p className="mt-2 text-sm text-gray-500 sm:text-xl">
          Sign in to your TaskFlow account
        </p>

        {/* Card */}
        <div className="mt-6 w-full rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-md sm:mt-10 sm:px-10 sm:py-10">

          <form onSubmit={onSubmitHandler} className="space-y-5 sm:space-y-7">
            {/* Email */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 sm:text-xl">
                Email address
              </label>
              <input
                type="email"
                name="email"
                placeholder="you@example.com"
                onChange={e => setEmail(e.target.value)}
                value={email}
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 sm:text-xl">
                Password
              </label>
              <PasswordInput
                name="password"
                onChange={e => setPassword(e.target.value)}
                value={password}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                required
              />

              <div className="flex justify-end">
                <button
                  type="button"
                  className="cursor-pointer text-sm text-red-400 hover:text-red-500 sm:text-xl"
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
              className="w-full cursor-pointer rounded-lg bg-red-400 py-3 text-sm font-medium text-white transition hover:bg-red-500 sm:text-xl"
            >
              Sign in
            </button>

            {/* Bottom text */}
            <p className="text-center text-sm text-gray-500 sm:text-xl">
              Don&apos;t have an account?{" "}
              <button
                type="button"
                className="cursor-pointer font-medium text-red-400 hover:text-red-500"
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
