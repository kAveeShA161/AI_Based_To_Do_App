import React, { useEffect, useMemo, useState } from "react";
import TaskCard from "./TaskCard";

const moodMeta = {
    motivated: {
        label: "Motivated",
        iconClass: "fa-solid fa-face-smile-beam",
        badgeClass: "bg-emerald-100 text-emerald-700",
        fillClass: "bg-emerald-400/25",
    },
    "low-energy": {
        label: "Low Energy",
        iconClass: "fa-solid fa-face-frown",
        badgeClass: "bg-amber-100 text-amber-700",
        fillClass: "bg-amber-400/25",
    },
    tired: {
        label: "Tired",
        iconClass: "fa-solid fa-bed",
        badgeClass: "bg-violet-100 text-violet-700",
        fillClass: "bg-violet-400/25",
    },
};

const getDateKey = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date.toISOString().split("T")[0];
};

const startOfMonth = (value) => new Date(value.getFullYear(), value.getMonth(), 1);
const isSameDay = (left, right) => getDateKey(left) === getDateKey(right);

const CalendarHistoryModal = ({
    open,
    onClose,
    tasks = [],
    moodHistory = [],
    initialDate = null,
    loading = false,
}) => {
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    const [activeMonth, setActiveMonth] = useState(startOfMonth(today));
    const [selectedDate, setSelectedDate] = useState(initialDate || today);
    const [activeBucket, setActiveBucket] = useState("all");
    const [filterMenuOpen, setFilterMenuOpen] = useState(false);

    useEffect(() => {
        if (!open) {
            return;
        }

        const safeDate = initialDate ? new Date(initialDate) : today;
        safeDate.setHours(0, 0, 0, 0);
        setSelectedDate(safeDate);
        setActiveMonth(startOfMonth(safeDate));
        setActiveBucket("all");
        setFilterMenuOpen(false);
    }, [initialDate, open, today]);

    const moodMap = useMemo(() => {
        return moodHistory.reduce((acc, entry) => {
            if (entry?.date && entry?.mood) {
                acc[getDateKey(entry.date)] = entry.mood;
            }
            return acc;
        }, {});
    }, [moodHistory]);

    const sortedTasks = useMemo(() => {
        const priorityOrder = { High: 1, Medium: 2, Low: 3 };
        return [...tasks].sort((a, b) => {
            if (a.isCompleted !== b.isCompleted) {
                return Number(a.isCompleted) - Number(b.isCompleted);
            }

            const aDue = a.dueDate ? new Date(a.dueDate).getTime() : Number.MAX_SAFE_INTEGER;
            const bDue = b.dueDate ? new Date(b.dueDate).getTime() : Number.MAX_SAFE_INTEGER;

            if (aDue !== bDue) {
                return aDue - bDue;
            }

            return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
        });
    }, [tasks]);

    const selectedDayKey = getDateKey(selectedDate);
    const selectedDayMood = moodMap[selectedDayKey];

    const selectedDayGroups = useMemo(() => {
        const dayTime = new Date(selectedDate).getTime();

        const done = [];
        const todo = [];
        const overdue = [];

        sortedTasks.forEach((task) => {
            if (!task.dueDate) {
                return;
            }

            const dueDate = new Date(task.dueDate);
            dueDate.setHours(0, 0, 0, 0);
            const dueTime = dueDate.getTime();

            if (dueTime === dayTime) {
                if (task.isCompleted) {
                    done.push(task);
                } else {
                    todo.push(task);
                }
                return;
            }

            if (dueTime < dayTime && !task.isCompleted) {
                overdue.push(task);
            }
        });

        return {
            all: [...done, ...todo, ...overdue],
            done,
            todo,
            overdue,
        };
    }, [selectedDate, sortedTasks]);

    const visibleTasks = selectedDayGroups[activeBucket] || [];

    const monthDays = useMemo(() => {
        const firstDay = startOfMonth(activeMonth);
        const firstWeekday = firstDay.getDay();
        const totalDays = new Date(
            activeMonth.getFullYear(),
            activeMonth.getMonth() + 1,
            0
        ).getDate();

        const cells = [];

        for (let i = 0; i < firstWeekday; i += 1) {
            cells.push(null);
        }

        for (let day = 1; day <= totalDays; day += 1) {
            cells.push(new Date(activeMonth.getFullYear(), activeMonth.getMonth(), day));
        }

        return cells;
    }, [activeMonth]);

    const monthStats = useMemo(() => {
        return monthDays.reduce((acc, date) => {
            if (!date) {
                return acc;
            }

            const dateKey = getDateKey(date);
            const dayTime = date.getTime();

            acc[dateKey] = sortedTasks.reduce(
                (stats, task) => {
                    if (!task.dueDate) {
                        return stats;
                    }

                    const dueDate = new Date(task.dueDate);
                    dueDate.setHours(0, 0, 0, 0);
                    const dueTime = dueDate.getTime();

                    if (dueTime === dayTime) {
                        if (task.isCompleted) {
                            stats.done += 1;
                        } else {
                            stats.todo += 1;
                        }
                    } else if (dueTime < dayTime && !task.isCompleted) {
                        stats.overdue += 1;
                    }

                    return stats;
                },
                { done: 0, todo: 0, overdue: 0, total: 0, completion: 0 }
            );

            const totalForDay = acc[dateKey].done + acc[dateKey].todo;
            acc[dateKey].total = totalForDay;
            acc[dateKey].completion =
                totalForDay > 0 ? Math.round((acc[dateKey].done / totalForDay) * 100) : 0;

            return acc;
        }, {});
    }, [monthDays, sortedTasks]);

    const canGoNextMonth = !isSameDay(startOfMonth(activeMonth), startOfMonth(today));

    const formatLongDate = (value) =>
        new Date(value).toLocaleDateString(undefined, {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });

    const filterItems = [
        { id: "all", label: "All", count: selectedDayGroups.all.length },
        { id: "done", label: "Done", count: selectedDayGroups.done.length },
        { id: "todo", label: "To Do", count: selectedDayGroups.todo.length },
        { id: "overdue", label: "Overdue", count: selectedDayGroups.overdue.length },
    ];
    const activeFilter = filterItems.find((item) => item.id === activeBucket) || filterItems[0];

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 px-4 py-4 sm:items-center sm:py-6">
            <div className="relative flex max-h-[calc(100vh-2rem)] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl sm:max-h-[92vh]">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-3 top-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900 sm:right-4 sm:h-11 sm:w-11"
                    aria-label="Close calendar history"
                >
                    <i className="fa-solid fa-xmark text-base sm:text-xl" aria-hidden="true"></i>
                </button>

                <div className="border-b border-slate-200 bg-white px-5 py-4 sm:px-8 sm:py-5">
                    <div className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-teal-500 sm:text-sm sm:tracking-[0.24em]">
                                History Calendar
                            </p>
                            
                        </div>
                        
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-4 overflow-y-auto p-4 sm:gap-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white px-5 py-4 shadow-sm sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3 sm:mb-5">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveMonth(
                                        new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)
                                    )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-100 sm:h-11 sm:w-11 sm:text-base"
                            >
                                <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                            </button>

                            <div className="text-center">
                                <h3 className="text-lg font-semibold text-slate-900 sm:text-xl">
                                    {activeMonth.toLocaleDateString(undefined, {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h3>
                                <p className="text-xs text-slate-500 sm:text-sm">Past days only</p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveMonth(
                                        new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)
                                    )
                                }
                                disabled={!canGoNextMonth}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40 sm:h-11 sm:w-11 sm:text-base"
                            >
                                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div className="ml-[5%] mr-auto mb-2 grid w-[94%] grid-cols-7 gap-1.5 text-center text-[10px] font-semibold uppercase tracking-[0.14em] text-slate-400 sm:mx-0 sm:mb-3 sm:w-full sm:gap-2 sm:text-xs sm:tracking-[0.2em]">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="py-1.5 sm:py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="ml-[5%] mr-auto grid w-[94%] grid-cols-7 gap-1.5 sm:mx-0 sm:w-full sm:gap-2">
                            {monthDays.map((date, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="aspect-square rounded-xl bg-transparent sm:rounded-2xl"></div>;
                                }

                                const dateKey = getDateKey(date);
                                const isFuture = date.getTime() > today.getTime();
                                const isSelected = selectedDayKey === dateKey;
                                const mood = moodMap[dateKey];
                                const stats = monthStats[dateKey] || {
                                    done: 0,
                                    todo: 0,
                                    overdue: 0,
                                    total: 0,
                                    completion: 0,
                                };
                                const fillClass = moodMeta[mood]?.fillClass || "bg-slate-300/20";

                                return (
                                    <button
                                        key={dateKey}
                                        type="button"
                                        disabled={isFuture}
                                        onClick={() => {
                                            setSelectedDate(date);
                                            setActiveBucket("all");
                                        }}
                                        className={`relative aspect-square overflow-hidden rounded-xl border p-0.5 text-left transition-all sm:rounded-2xl sm:p-2 ${
                                            isSelected
                                                ? "border-teal-400 bg-teal-50 shadow-sm"
                                                : "border-slate-200 bg-slate-50 hover:border-slate-300 hover:bg-white"
                                        } ${isFuture ? "cursor-not-allowed opacity-40" : ""}`}
                                    >
                                        <div
                                            className={`absolute inset-x-0 bottom-0 rounded-b-2xl transition-all duration-300 ${fillClass}`}
                                            style={{ height: `${stats.completion}%` }}
                                            aria-hidden="true"
                                        ></div>

                                        <div className="relative z-10 flex h-full flex-col justify-between">
                                            <div className="flex items-start justify-between">
                                            <span className="pl-1 text-[10px] font-semibold leading-none text-slate-900 sm:pl-0 sm:text-sm sm:leading-normal">
                                                {date.getDate()}
                                            </span>
                                            {mood && moodMeta[mood] && (
                                                <span className={`flex h-4 w-4 items-center justify-center rounded-full text-[7px] sm:h-7 sm:w-7 sm:text-xs ${moodMeta[mood].badgeClass}`}>
                                                    <i className={moodMeta[mood].iconClass} aria-hidden="true"></i>
                                                </span>
                                            )}
                                            </div>

                                            <div className="mt-1 flex items-end justify-between gap-0.5 sm:mt-3 sm:gap-2">
                                                <span className="rounded-full bg-white/80 px-1 py-0.5 text-[7px] font-semibold leading-none text-slate-600 backdrop-blur-sm sm:px-2 sm:py-1 sm:text-[11px] sm:leading-normal">
                                                    {stats.completion}%
                                                </span>
                                                {stats.total > 0 && (
                                                    <span className="text-[7px] font-medium leading-none text-slate-500 sm:text-[11px] sm:leading-normal">
                                                        {stats.done}/{stats.total}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>

                    <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
                        <div className="border-b border-slate-200 pb-4 sm:pb-5">
                            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400 sm:text-sm sm:tracking-[0.2em]">
                                Selected Day
                            </p>
                            <h3 className="mt-2 text-xl font-bold text-slate-900 sm:text-2xl">
                                {formatLongDate(selectedDate)}
                            </h3>

                            <div className="mt-3 flex flex-wrap items-center justify-between gap-2 sm:mt-4 sm:justify-start sm:gap-3">
                                {selectedDayMood && moodMeta[selectedDayMood] ? (
                                    <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-medium sm:px-4 sm:py-2 sm:text-sm ${moodMeta[selectedDayMood].badgeClass}`}>
                                        <i className={moodMeta[selectedDayMood].iconClass} aria-hidden="true"></i>
                                        Mood: {moodMeta[selectedDayMood].label}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-500 sm:px-4 sm:py-2 sm:text-sm">
                                        <i className="fa-regular fa-face-meh" aria-hidden="true"></i>
                                        No mood saved
                                    </span>
                                )}

                                <div className="relative sm:hidden">
                                    <button
                                        type="button"
                                        onClick={() => setFilterMenuOpen((current) => !current)}
                                        className="inline-flex items-center gap-2 rounded-full bg-slate-900 px-3 py-1.5 text-xs font-medium text-white shadow-sm"
                                    >
                                        Filter: {activeFilter.label}
                                        <span className="rounded-full bg-white/15 px-1.5 py-0.5 text-[10px]">
                                            {activeFilter.count}
                                        </span>
                                        <i className={`fa-solid fa-chevron-down text-[9px] transition-transform ${filterMenuOpen ? "rotate-180" : ""}`} aria-hidden="true"></i>
                                    </button>

                                    {filterMenuOpen && (
                                        <div className="absolute right-0 top-full z-30 mt-2 w-36 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                                            {filterItems.map((item) => (
                                                <button
                                                    key={item.id}
                                                    type="button"
                                                    onClick={() => {
                                                        setActiveBucket(item.id);
                                                        setFilterMenuOpen(false);
                                                    }}
                                                    className={`flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors ${
                                                        activeBucket === item.id
                                                            ? "bg-slate-900 text-white"
                                                            : "text-slate-600 hover:bg-slate-50"
                                                    }`}
                                                >
                                                    <span>{item.label}</span>
                                                    <span className={`rounded-full px-1.5 py-0.5 text-[10px] ${activeBucket === item.id ? "bg-white/15" : "bg-slate-100 text-slate-500"}`}>
                                                        {item.count}
                                                    </span>
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="mt-4 hidden flex-wrap gap-2 sm:mt-5 sm:flex sm:gap-3">
                            {filterItems.map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveBucket(item.id)}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                                        activeBucket === item.id
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {item.label}
                                    <span className={`rounded-full px-2 py-0.5 text-[10px] sm:text-xs ${activeBucket === item.id ? "bg-white/15" : "bg-white text-slate-500"}`}>
                                        {item.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-4 flex-1 overflow-y-auto pr-1 sm:mt-5">
                            {loading ? (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500 sm:px-6 sm:py-10 sm:text-base">
                                    Loading calendar history...
                                </div>
                            ) : visibleTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {visibleTasks.map((task) => (
                                        <TaskCard key={task._id} task={task} readOnly />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-4 py-8 text-center text-xs text-slate-500 sm:px-6 sm:py-10 sm:text-base">
                                    No tasks match this day and filter.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CalendarHistoryModal;
