import React, { useContext, useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { assets } from "./../assets/assets";
import { AppContext } from "../context/AppContext";
import PasswordInput from "../components/PasswordInput";

const ResetPassword = () => {
  const navigate = useNavigate();
  const { backendUrl } = useContext(AppContext);

  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSendOtp = async (event) => {
    event.preventDefault();

    if (!email.trim()) {
      toast.error("Email is required.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/send-reset-otp`, {
        email,
      });

      if (data.success) {
        setOtpSent(true);
        toast.success(data.message || "Reset OTP sent to your email.");
        return;
      }

      toast.error(data.message || "Unable to send reset OTP.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to send reset OTP."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();

    if (!otp.trim()) {
      toast.error("OTP is required.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(`${backendUrl}/api/auth/reset-password`, {
        email,
        otp,
        newPassword,
      });

      if (data.success) {
        toast.success(data.message || "Password reset successfully.");
        navigate("/login");
        return;
      }

      toast.error(data.message || "Unable to reset password.");
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Unable to reset password."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-xl flex flex-col items-center">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="cursor-pointer"
          aria-label="Go to home"
        >
          <img src={assets.Logo} alt="TaskFlow logo" className="w-20" />
        </button>

        <h1 className="mt-5 text-2xl font-bold text-gray-900 sm:mt-6 sm:text-4xl">
          Reset password
        </h1>
        <p className="mt-2 text-center text-sm text-gray-500 sm:text-xl">
          Enter your email and use the OTP to set a new password
        </p>

        <div className="mt-6 w-full rounded-2xl border border-gray-100 bg-white px-5 py-6 shadow-md sm:mt-10 sm:px-10 sm:py-10">
          {!otpSent ? (
            <form onSubmit={handleSendOtp} className="space-y-5 sm:space-y-7">
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 sm:text-xl">
                  Email address
                </label>
                <input
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-red-400 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl"
              >
                {loading ? "Sending..." : "Send OTP"}
              </button>
            </form>
          ) : (
            <form onSubmit={handleResetPassword} className="space-y-5 sm:space-y-6">
              <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600 sm:text-base">
                OTP sent to {email}. It expires in 15 minutes.
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 sm:text-xl">
                  Reset OTP
                </label>
                <input
                  type="text"
                  inputMode="numeric"
                  maxLength={6}
                  name="otp"
                  placeholder="123456"
                  value={otp}
                  onChange={(event) => setOtp(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 sm:text-xl">
                  New password
                </label>
                <PasswordInput
                  name="newPassword"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700 sm:text-xl">
                  Confirm new password
                </label>
                <PasswordInput
                  name="confirmPassword"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  className="w-full rounded-lg border border-gray-200 px-4 py-3 text-sm outline-none focus:border-red-300 focus:ring-2 focus:ring-red-200 sm:text-xl"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full rounded-lg bg-red-400 py-3 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl"
              >
                {loading ? "Resetting..." : "Reset password"}
              </button>

              <button
                type="button"
                disabled={loading}
                onClick={handleSendOtp}
                className="w-full text-center text-sm font-medium text-red-400 hover:text-red-500 disabled:cursor-not-allowed disabled:opacity-70 sm:text-xl"
              >
                Resend OTP
              </button>
            </form>
          )}

          <p className="mt-6 text-center text-sm text-gray-500 sm:mt-7 sm:text-xl">
            Remembered your password?{" "}
            <button
              type="button"
              onClick={() => navigate("/login")}
              className="font-medium text-red-400 hover:text-red-500"
            >
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
