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

    useEffect(() => {
        if (!open) {
            return;
        }

        const safeDate = initialDate ? new Date(initialDate) : today;
        safeDate.setHours(0, 0, 0, 0);
        setSelectedDate(safeDate);
        setActiveMonth(startOfMonth(safeDate));
        setActiveBucket("all");
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

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4 py-6">
            <div className="relative flex max-h-[92vh] w-full max-w-7xl flex-col overflow-hidden rounded-3xl bg-slate-50 shadow-2xl">
                <button
                    type="button"
                    onClick={onClose}
                    className="absolute right-4 top-3 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white text-slate-500 shadow-sm transition-colors hover:text-slate-900"
                    aria-label="Close calendar history"
                >
                    <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
                </button>

                <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-500">
                                History Calendar
                            </p>
                            
                        </div>
                        
                    </div>
                </div>

                <div className="grid flex-1 grid-cols-1 gap-6 overflow-y-auto p-6 sm:p-8 xl:grid-cols-[1.15fr_0.85fr]">
                    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="mb-5 flex items-center justify-between gap-3">
                            <button
                                type="button"
                                onClick={() =>
                                    setActiveMonth(
                                        new Date(activeMonth.getFullYear(), activeMonth.getMonth() - 1, 1)
                                    )
                                }
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100"
                            >
                                <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                            </button>

                            <div className="text-center">
                                <h3 className="text-xl font-semibold text-slate-900">
                                    {activeMonth.toLocaleDateString(undefined, {
                                        month: "long",
                                        year: "numeric",
                                    })}
                                </h3>
                                <p className="text-sm text-slate-500">Past days only</p>
                            </div>

                            <button
                                type="button"
                                onClick={() =>
                                    setActiveMonth(
                                        new Date(activeMonth.getFullYear(), activeMonth.getMonth() + 1, 1)
                                    )
                                }
                                disabled={!canGoNextMonth}
                                className="flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                            >
                                <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                            </button>
                        </div>

                        <div className="mb-3 grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                                <div key={day} className="py-2">
                                    {day}
                                </div>
                            ))}
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {monthDays.map((date, index) => {
                                if (!date) {
                                    return <div key={`empty-${index}`} className="aspect-square rounded-2xl bg-transparent"></div>;
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
                                        className={`relative aspect-square overflow-hidden rounded-2xl border p-2 text-left transition-all ${
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
                                            <span className="text-sm font-semibold text-slate-900">
                                                {date.getDate()}
                                            </span>
                                            {mood && moodMeta[mood] && (
                                                <span className={`flex h-7 w-7 items-center justify-center rounded-full text-xs ${moodMeta[mood].badgeClass}`}>
                                                    <i className={moodMeta[mood].iconClass} aria-hidden="true"></i>
                                                </span>
                                            )}
                                            </div>

                                            <div className="mt-3 flex items-end justify-between gap-2">
                                                <span className="rounded-full bg-white/80 px-2 py-1 text-[11px] font-semibold text-slate-600 backdrop-blur-sm">
                                                    {stats.completion}%
                                                </span>
                                                {stats.total > 0 && (
                                                    <span className="text-[11px] font-medium text-slate-500">
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

                    <div className="flex min-h-0 flex-col rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                        <div className="border-b border-slate-200 pb-5">
                            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-400">
                                Selected Day
                            </p>
                            <h3 className="mt-2 text-2xl font-bold text-slate-900">
                                {formatLongDate(selectedDate)}
                            </h3>

                            <div className="mt-4 flex flex-wrap items-center gap-3">
                                {selectedDayMood && moodMeta[selectedDayMood] ? (
                                    <span className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${moodMeta[selectedDayMood].badgeClass}`}>
                                        <i className={moodMeta[selectedDayMood].iconClass} aria-hidden="true"></i>
                                        Mood: {moodMeta[selectedDayMood].label}
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-2 rounded-full bg-slate-100 px-4 py-2 text-sm font-medium text-slate-500">
                                        <i className="fa-regular fa-face-meh" aria-hidden="true"></i>
                                        No mood saved
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="mt-5 flex flex-wrap gap-3">
                            {[
                                { id: "all", label: "All", count: selectedDayGroups.all.length },
                                { id: "done", label: "Done", count: selectedDayGroups.done.length },
                                { id: "todo", label: "To Do", count: selectedDayGroups.todo.length },
                                { id: "overdue", label: "Overdue", count: selectedDayGroups.overdue.length },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    type="button"
                                    onClick={() => setActiveBucket(item.id)}
                                    className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                                        activeBucket === item.id
                                            ? "bg-slate-900 text-white"
                                            : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                                    }`}
                                >
                                    {item.label}
                                    <span className={`rounded-full px-2 py-0.5 text-xs ${activeBucket === item.id ? "bg-white/15" : "bg-white text-slate-500"}`}>
                                        {item.count}
                                    </span>
                                </button>
                            ))}
                        </div>

                        <div className="mt-5 flex-1 overflow-y-auto pr-1">
                            {loading ? (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
                                    Loading calendar history...
                                </div>
                            ) : visibleTasks.length > 0 ? (
                                <div className="space-y-4">
                                    {visibleTasks.map((task) => (
                                        <TaskCard key={task._id} task={task} readOnly />
                                    ))}
                                </div>
                            ) : (
                                <div className="rounded-3xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center text-slate-500">
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
