import React, { useContext, useState } from "react";
import { assets } from "./../assets/assets";
import { useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import PasswordInput from "../components/PasswordInput";

const Register = () => {
  const navigate = useNavigate();

  const { backendUrl, setIsLoggedIn, getUserData } = useContext(AppContext);

  const [form, setForm] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");

  const handleChange = (e) => {
    // do this with toast notifications instead of showing the error in the form
    setError("");
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // ✅ validate BEFORE API call
    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      const res = await axios.post(
        `${backendUrl}/api/auth/register`,
        {
          fullName: form.fullName,
          email: form.email,
          password: form.password,
          confirmPassword: form.confirmPassword,
        },
        { withCredentials: true } // ✅ don't set defaults here, just use config
      );

      // ✅ check HTTP status OR your API's returned flag
      if (res.data.success) {
        setIsLoggedIn(true);
        getUserData();
        toast.success("Registration successful!");
        navigate("/");
        return;
      }

      toast.error(res.data.message);
    } catch (err) {
      console.error("Registration error:", err);

      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred during registration. Please try again.";

      toast.error(msg);
    }
  };


  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl flex flex-col items-center">
        {/* Top Logo */}
        <div onClick={() => navigate('/')} className="cursor-pointer">
          <img src={assets.Logo} alt="logo" className="w-20" />
        </div>

        {/* Header */}
        <h1 className="mt-6 text-4xl font-bold text-gray-900">
          Create your account
        </h1>
        <p className="text-xl mt-2 text-gray-500 text-base">
          Start managing your tasks smarter
        </p>

        {/* Card */}
        <div className="text-xl mt-10 w-full bg-white rounded-2xl shadow-md border border-gray-100 px-10 py-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Error */}
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Full name */}
            <div className="space-y-2">
              <label className="font-medium text-gray-700">
                Full name
              </label>
              <input
                type="text"
                name="fullName"
                value={form.fullName}
                onChange={handleChange}
                placeholder="John Doe"
                className="w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="text-xl font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />
            </div>

            {/* Password */}
            <div className="space-y-2">
              <label className="text-xl font-medium text-gray-700">
                Password
              </label>
              <PasswordInput
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="••••••••"
                className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />
            </div>

            {/* Confirm password */}
            <div className="space-y-2">
              <label className="text-xl font-medium text-gray-700">
                Confirm password
              </label>
              <PasswordInput
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                className="text-xl w-full border border-gray-200 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-red-200 focus:border-red-300"
                required
              />
            </div>

            {/* Button */}
            <button
              type="submit"
              className="text-xl w-full bg-red-400 hover:bg-red-500 text-white font-medium py-3 rounded-lg transition cursor-pointer"
            >
              Create account
            </button>

            {/* Bottom link */}
            <p className="text-xl text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button
                type="button"
                className="text-red-400 hover:text-red-500 font-medium cursor-pointer"
                onClick={() => {
                  navigate("/login")
                  console.log("Go to Sign in")
                }}
              >
                Sign in
              </button>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
