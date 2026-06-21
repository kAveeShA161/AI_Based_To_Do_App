import React, { useContext, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { AppContext } from "../context/AppContext";
import { assets } from "./../assets/assets";
import CalendarHistoryModal from "./CalendarHistoryModal";
import MonthlyStatsModal from "./MonthlyStatsModal";

const NavBar = ({ actionSlot = null }) => {
  const [open, setOpen] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyData, setHistoryData] = useState({ tasks: [], moodHistory: [] });

  const menuRef = useRef();
  const mobileMenuRef = useRef();
  const navigate = useNavigate();
  const location = useLocation();

  const { userData, isLoggedIn, backendUrl, setUserData, setIsLoggedIn } =
    useContext(AppContext);

  const fetchHistoryData = async () => {
    if (!isLoggedIn) return;

    try {
      setHistoryLoading(true);
      const { data } = await axios.get(`${backendUrl}/api/dashboard/calendar-history`, {
        withCredentials: true,
      });

      if (data.success) {
        setHistoryData({
          tasks: data.data?.tasks || [],
          moodHistory: data.data?.moodHistory || [],
        });
        setHistoryLoaded(true);
      } else {
        toast.error(data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setHistoryLoading(false);
    }
  };

  const openCalendar = async () => {
    setCalendarOpen(true);
    setMobileMenu(false);
    if (!historyLoaded && !historyLoading) {
      await fetchHistoryData();
    }
  };

  const openStats = async () => {
    setStatsOpen(true);
    setMobileMenu(false);
    if (!historyLoaded && !historyLoading) {
      await fetchHistoryData();
    }
  };

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
    const handler = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpen(false);
      }

      if (
        mobileMenu &&
        mobileMenuRef.current &&
        !mobileMenuRef.current.contains(event.target)
      ) {
        setMobileMenu(false);
      }
    };

    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
  }, [mobileMenu]);

  const goHome = () => navigate(isLoggedIn ? "/dashboard" : "/login");

  const NavButton = ({ path, label, icon }) => (
    <button
      type="button"
      onClick={() => {
        navigate(path);
        setMobileMenu(false);
      }}
      className={`flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-medium transition-colors ${
        location.pathname === path
          ? "bg-teal-400 text-white shadow-sm"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"
      }`}
    >
      <i className={`${icon} w-5 text-center`} aria-hidden="true"></i>
      {label}
    </button>
  );

  return (
    <>
      <aside className="fixed left-0 top-0 z-40 hidden h-screen w-72 flex-col border-r border-slate-200 bg-white px-5 py-5 shadow-[18px_0_45px_rgba(15,23,42,0.06)] lg:flex">
        <button
          type="button"
          onClick={goHome}
          className="flex items-center gap-3 rounded-2xl px-2 py-2 text-left"
        >
          <img src={assets.Logo} alt="TaskFlow logo" className="h-10 w-10" />
          <span>
            <span className="block text-xl font-bold text-slate-950">TaskFlow</span>
            <span className="block text-xs font-medium text-slate-400">
              AI task workspace
            </span>
          </span>
        </button>

        <nav className="mt-8 space-y-2">
          <NavButton path="/dashboard" label="Dashboard" icon="fa-solid fa-chart-line" />
          <NavButton path="/my-tasks" label="My Tasks" icon="fa-regular fa-circle-check" />
          <NavButton
            path="/ai-planner"
            label="AI Planner"
            icon="fa-solid fa-wand-magic-sparkles"
          />
        </nav>

        {isLoggedIn && (
          <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
            <button
              type="button"
              onClick={() => navigate("/create-task")}
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-red-400 px-4 py-3 text-base font-semibold text-white shadow-sm transition hover:bg-red-500"
            >
              <i className="fa-solid fa-plus" aria-hidden="true"></i>
              New Task
            </button>

            <button
              type="button"
              onClick={openStats}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:border-teal-300 hover:text-teal-600"
            >
              <i className="fa-solid fa-chart-line w-5 text-center" aria-hidden="true"></i>
              Monthly Stats
            </button>

            <button
              type="button"
              onClick={openCalendar}
              className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-600 transition-colors hover:border-teal-300 hover:text-teal-600"
            >
              <i className="fa-regular fa-calendar-days w-5 text-center" aria-hidden="true"></i>
              History Calendar
            </button>
          </div>
        )}

        {actionSlot}

        <div className="mt-auto">
          {isLoggedIn && userData ? (
            <div className="relative" ref={menuRef}>
              <button
                type="button"
                onClick={() => setOpen((current) => !current)}
                className="flex w-full items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-3 text-left transition hover:bg-slate-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-400 text-sm font-semibold leading-none tracking-tight text-white">
                  {userData.fullName ? userData.fullName.slice(0, 2).toUpperCase() : "U"}
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-semibold text-slate-950">
                    {userData.fullName}
                  </span>
                  <span className="block truncate text-xs text-slate-500">
                    {userData.email}
                  </span>
                </span>
              </button>

              {open && (
                <div className="absolute bottom-16 left-0 z-50 w-full overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl">
                  <div className="border-b border-gray-100 px-4 py-3">
                    <p className="text-sm font-semibold text-gray-900">{userData.fullName}</p>
                    <p className="mt-1 truncate text-xs text-gray-500">{userData.email}</p>
                  </div>

                  <div className="p-2">
                    <button
                      type="button"
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
            <div className="grid gap-2">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="rounded-xl bg-red-400 px-4 py-2.5 text-sm font-semibold text-white"
              >
                Login
              </button>
              <button
                type="button"
                onClick={() => navigate("/register")}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700"
              >
                Register
              </button>
            </div>
          )}
        </div>
      </aside>

      <div className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 shadow-sm lg:hidden">
        <button type="button" onClick={goHome} className="flex items-center gap-2">
          <img src={assets.Logo} alt="TaskFlow logo" className="h-8 w-8" />
          <span className="text-lg font-bold text-slate-950">TaskFlow</span>
        </button>

        <div className="flex items-center gap-3">
          {isLoggedIn && (
            <button
              type="button"
              onClick={() => navigate("/create-task")}
              className="rounded-xl bg-red-400 px-3 py-2 text-sm font-semibold text-white"
            >
              + New
            </button>
          )}

          <button
            type="button"
            className="rounded-xl border border-slate-200 px-3 py-2 text-lg text-slate-700"
            onClick={() => setMobileMenu((current) => !current)}
            aria-label="Open navigation menu"
          >
            <i className="fa-solid fa-bars" aria-hidden="true"></i>
          </button>
        </div>
      </div>

      {mobileMenu && (
        <div className="fixed inset-0 z-50 bg-slate-950/45 backdrop-blur-sm lg:hidden">
          <div
            ref={mobileMenuRef}
            className="flex h-full w-[min(82vw,320px)] animate-[slideInLeft_180ms_ease-out] flex-col border-r border-slate-200 bg-white px-5 py-5 shadow-2xl"
          >
            <div className="mb-8 flex items-center justify-between">
              <button type="button" onClick={goHome} className="flex items-center gap-3">
                <img src={assets.Logo} alt="TaskFlow logo" className="h-9 w-9" />
                <span className="text-lg font-bold text-slate-950">TaskFlow</span>
              </button>

              <button
                type="button"
                onClick={() => setMobileMenu(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-slate-600"
                aria-label="Close navigation menu"
              >
                <i className="fa-solid fa-xmark" aria-hidden="true"></i>
              </button>
            </div>

            <nav className="space-y-2">
              <NavButton path="/dashboard" label="Dashboard" icon="fa-solid fa-chart-line" />
              <NavButton path="/my-tasks" label="My Tasks" icon="fa-regular fa-circle-check" />
              <NavButton
                path="/ai-planner"
                label="AI Planner"
                icon="fa-solid fa-wand-magic-sparkles"
              />
            </nav>

            {isLoggedIn ? (
              <div className="mt-8 space-y-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={openStats}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <i className="fa-solid fa-chart-line w-5 text-center" aria-hidden="true"></i>
                  Monthly Stats
                </button>

                <button
                  type="button"
                  onClick={openCalendar}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold text-slate-700 hover:bg-slate-100"
                >
                  <i className="fa-regular fa-calendar-days w-5 text-center" aria-hidden="true"></i>
                  History Calendar
                </button>

                <button
                  type="button"
                  onClick={logout}
                  className="flex w-full items-center gap-3 rounded-2xl px-4 py-3 text-left text-base font-semibold text-red-500 hover:bg-red-50"
                >
                  <i className="fa-solid fa-right-from-bracket w-5 text-center" aria-hidden="true"></i>
                  Sign Out
                </button>
              </div>
            ) : (
              <div className="mt-8 grid gap-3 border-t border-slate-100 pt-6">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                    setMobileMenu(false);
                  }}
                  className="rounded-2xl bg-red-400 px-4 py-3 text-base font-semibold text-white"
                >
                  Login
                </button>

                <button
                  type="button"
                  onClick={() => {
                    navigate("/register");
                    setMobileMenu(false);
                  }}
                  className="rounded-2xl border border-slate-200 px-4 py-3 text-base font-semibold text-slate-700"
                >
                  Register
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <CalendarHistoryModal
        open={calendarOpen}
        onClose={() => setCalendarOpen(false)}
        tasks={historyData.tasks}
        moodHistory={historyData.moodHistory}
        loading={historyLoading}
      />

      <MonthlyStatsModal
        open={statsOpen}
        onClose={() => setStatsOpen(false)}
        tasks={historyData.tasks}
      />
    </>
  );
};

export default NavBar;
