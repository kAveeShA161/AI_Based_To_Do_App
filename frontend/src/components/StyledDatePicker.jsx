import React, { useEffect, useMemo, useRef, useState } from "react";

const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const parseDateValue = (value) => {
    if (!value) {
        return null;
    }

    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) {
        return null;
    }

    return new Date(year, month - 1, day);
};

const formatDateValue = (date) => {
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
};

const getMonthDays = (viewDate) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const daysInPreviousMonth = new Date(year, month, 0).getDate();
    const days = [];

    for (let index = firstDay - 1; index >= 0; index -= 1) {
        days.push(new Date(year, month - 1, daysInPreviousMonth - index));
    }

    for (let day = 1; day <= daysInMonth; day += 1) {
        days.push(new Date(year, month, day));
    }

    while (days.length < 42) {
        const nextDay = days.length - firstDay - daysInMonth + 1;
        days.push(new Date(year, month + 1, nextDay));
    }

    return days;
};

const StyledDatePicker = ({
    value,
    onChange,
    className = "",
    placeholder = "mm/dd/yyyy",
    popoverClassName = "",
}) => {
    const selectedDate = useMemo(() => parseDateValue(value), [value]);
    const [isOpen, setIsOpen] = useState(false);
    const [viewDate, setViewDate] = useState(() => selectedDate || new Date());
    const pickerRef = useRef(null);

    useEffect(() => {
        if (selectedDate) {
            setViewDate(selectedDate);
        }
    }, [selectedDate]);

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (pickerRef.current && !pickerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const monthDays = useMemo(() => getMonthDays(viewDate), [viewDate]);

    const displayValue = selectedDate
        ? selectedDate.toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
        })
        : placeholder;

    const shiftMonth = (offset) => {
        setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
    };

    const selectDate = (date) => {
        onChange(formatDateValue(date));
        setViewDate(date);
        setIsOpen(false);
    };

    const selectToday = () => {
        const today = new Date();
        onChange(formatDateValue(today));
        setViewDate(today);
        setIsOpen(false);
    };

    const clearDate = () => {
        onChange("");
        setIsOpen(false);
    };

    return (
        <div ref={pickerRef} className={`relative ${isOpen ? "z-50" : "z-0"} ${className}`}>
            <button
                type="button"
                onClick={() => setIsOpen((current) => !current)}
                className={`flex w-full items-center justify-between gap-3 rounded-xl border bg-white px-4 py-3 text-left text-sm font-semibold shadow-sm outline-none transition-colors sm:text-lg ${
                    isOpen
                        ? "border-teal-300 ring-2 ring-teal-100"
                        : "border-gray-200 hover:border-teal-200 hover:bg-teal-50/30"
                } ${selectedDate ? "text-slate-800" : "text-slate-500"}`}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
            >
                <span className="truncate">{displayValue}</span>
                <i className="fa-regular fa-calendar text-slate-800" aria-hidden="true"></i>
            </button>

            {isOpen && (
                <div className={`absolute left-1/2 z-[999] mt-2 w-[min(20rem,calc(100vw-3rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15 ${popoverClassName}`}>
                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-2 py-2">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-teal-700"
                            aria-label="Previous month"
                        >
                            <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true"></i>
                        </button>
                        <span className="text-sm font-bold text-slate-900">
                            {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-teal-700"
                            aria-label="Next month"
                        >
                            <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true"></i>
                        </button>
                    </div>

                    <div className="mt-3 grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">
                        {WEEKDAYS.map((day) => (
                            <span key={day} className="py-1">
                                {day}
                            </span>
                        ))}
                    </div>

                    <div className="mt-1 grid grid-cols-7 gap-1">
                        {monthDays.map((date) => {
                            const dateValue = formatDateValue(date);
                            const isSelected = value === dateValue;
                            const isCurrentMonth = date.getMonth() === viewDate.getMonth();
                            const isToday = dateValue === formatDateValue(new Date());

                            return (
                                <button
                                    key={dateValue}
                                    type="button"
                                    onClick={() => selectDate(date)}
                                    className={`flex h-9 items-center justify-center rounded-xl text-xs font-semibold transition-all ${
                                        isSelected
                                            ? "bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                                            : isToday
                                                ? "bg-amber-50 text-amber-700 ring-1 ring-amber-200"
                                                : isCurrentMonth
                                                    ? "bg-slate-50 text-slate-700 hover:bg-teal-50 hover:text-teal-700"
                                                    : "bg-transparent text-slate-300 hover:bg-slate-50"
                                    }`}
                                >
                                    {date.getDate()}
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2">
                        <button
                            type="button"
                            onClick={clearDate}
                            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-500 transition-colors hover:bg-slate-50"
                        >
                            Clear
                        </button>
                        <button
                            type="button"
                            onClick={selectToday}
                            className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
                        >
                            Today
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StyledDatePicker;
