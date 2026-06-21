import React, { useEffect, useMemo, useRef, useState } from "react";

const seriesMeta = {
    done: {
        label: "Tasks Done",
        stroke: "#5c9f8a",
        fill: "bg-teal-50 text-teal-700 border-teal-200",
    },
    undone: {
        label: "Undone Tasks",
        stroke: "#c89a57",
        fill: "bg-amber-50 text-amber-700 border-amber-200",
    },
    overdue: {
        label: "Overdue Tasks",
        stroke: "#c7747a",
        fill: "bg-rose-50 text-rose-700 border-rose-200",
    },
};

const CHART_TOP_PADDING = 4;
const CHART_BOTTOM_PADDING = 2;
const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const getDateAtMidnight = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    return date;
};

const formatMonthValue = (value) => {
    const year = value.getFullYear();
    const month = `${value.getMonth() + 1}`.padStart(2, "0");
    return `${year}-${month}`;
};

const getYPosition = (value, maxValue) => {
    const usableHeight = 100 - CHART_TOP_PADDING - CHART_BOTTOM_PADDING;
    return CHART_TOP_PADDING + (1 - value / maxValue) * usableHeight;
};

const MonthlyTaskLineChart = ({ tasks = [] }) => {
    const [selectedMonth, setSelectedMonth] = useState(() => formatMonthValue(new Date()));
    const [isMonthPickerOpen, setIsMonthPickerOpen] = useState(false);
    const [visibleSeries, setVisibleSeries] = useState({
        done: true,
        undone: true,
        overdue: true,
    });
    const [hoveredPoint, setHoveredPoint] = useState(null);
    const monthPickerRef = useRef(null);

    const monthDate = useMemo(() => {
        const [year, month] = selectedMonth.split("-").map(Number);
        return new Date(year, month - 1, 1);
    }, [selectedMonth]);

    const chartData = useMemo(() => {
        const year = monthDate.getFullYear();
        const month = monthDate.getMonth();
        const totalDays = new Date(year, month + 1, 0).getDate();

        return Array.from({ length: totalDays }, (_, index) => {
            const dayNumber = index + 1;
            const currentDate = new Date(year, month, dayNumber);
            currentDate.setHours(0, 0, 0, 0);
            const currentTime = currentDate.getTime();

            const counts = tasks.reduce(
                (acc, task) => {
                    if (!task.dueDate) {
                        return acc;
                    }

                    const dueDate = getDateAtMidnight(task.dueDate);
                    const dueTime = dueDate.getTime();

                    if (dueTime === currentTime) {
                        if (task.isCompleted) {
                            acc.done += 1;
                        } else {
                            acc.undone += 1;
                        }
                    }

                    if (dueTime < currentTime && !task.isCompleted) {
                        acc.overdue += 1;
                    }

                    return acc;
                },
                { done: 0, undone: 0, overdue: 0 }
            );

            return {
                day: dayNumber,
                ...counts,
            };
        });
    }, [monthDate, tasks]);

    const maxValue = useMemo(() => {
        const values = chartData.flatMap((item) => [item.done, item.undone, item.overdue]);
        return Math.max(1, ...values);
    }, [chartData]);

    const formattedSelectedMonth = useMemo(
        () =>
            monthDate.toLocaleDateString(undefined, {
                month: "long",
                year: "numeric",
            }),
        [monthDate]
    );

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (monthPickerRef.current && !monthPickerRef.current.contains(event.target)) {
                setIsMonthPickerOpen(false);
            }
        };

        document.addEventListener("mousedown", handleOutsideClick);
        return () => document.removeEventListener("mousedown", handleOutsideClick);
    }, []);

    const toggleSeries = (key) => {
        setVisibleSeries((prev) => ({
            ...prev,
            [key]: !prev[key],
        }));
    };

    const shiftMonth = (offset) => {
        const next = new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1);
        setSelectedMonth(formatMonthValue(next));
    };

    const shiftYear = (offset) => {
        const next = new Date(monthDate.getFullYear() + offset, monthDate.getMonth(), 1);
        setSelectedMonth(formatMonthValue(next));
    };

    const selectMonth = (monthIndex) => {
        setSelectedMonth(formatMonthValue(new Date(monthDate.getFullYear(), monthIndex, 1)));
        setIsMonthPickerOpen(false);
    };

    const selectCurrentMonth = () => {
        setSelectedMonth(formatMonthValue(new Date()));
        setIsMonthPickerOpen(false);
    };

    const buildPath = (key) => {
        if (!chartData.length) {
            return "";
        }

        const width = 100;
        const height = 100;
        const stepX = chartData.length === 1 ? 0 : width / (chartData.length - 1);

        return chartData
            .map((point, index) => {
                const x = index * stepX;
                const y = getYPosition(point[key], maxValue);
                return `${index === 0 ? "M" : "L"} ${x} ${y}`;
            })
            .join(" ");
    };

    const getPointPosition = (point, index, key) => {
        const left =
            chartData.length === 1 ? 0 : (index / (chartData.length - 1)) * 100;
        const top = getYPosition(point[key], maxValue);

        return { left, top };
    };

    const formatPointDate = (day) =>
        new Date(monthDate.getFullYear(), monthDate.getMonth(), day).toLocaleDateString(
            undefined,
            {
                year: "numeric",
                month: "long",
                day: "numeric",
            }
        );

    const activeKeys = Object.keys(visibleSeries).filter((key) => visibleSeries[key]);

    return (
        <div className="rounded-3xl border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <h2 className="text-lg font-bold leading-snug text-slate-900 sm:text-2xl">
                        Daily task trend for the selected month
                    </h2>
                    <p className="mt-2 text-xs leading-5 text-slate-500 sm:text-sm">
                        Track completed, undone, and overdue tasks day by day.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:h-11 sm:w-11 sm:text-base"
                        >
                            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                        </button>

                        <div ref={monthPickerRef} className="relative min-w-0 flex-1">
                            <button
                                type="button"
                                onClick={() => setIsMonthPickerOpen((isOpen) => !isOpen)}
                                className="flex h-9 w-full min-w-0 items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 shadow-sm outline-none transition-colors hover:border-teal-200 hover:bg-teal-50/40 focus:border-teal-300 focus:ring-2 focus:ring-teal-100 sm:h-11 sm:px-4 sm:text-sm"
                                aria-haspopup="dialog"
                                aria-expanded={isMonthPickerOpen}
                            >
                                <span>{formattedSelectedMonth}</span>
                                <i className="fa-regular fa-calendar text-slate-800" aria-hidden="true"></i>
                            </button>

                            {isMonthPickerOpen && (
                                <div className="absolute left-1/2 z-30 mt-2 w-[min(18rem,calc(100vw-4rem))] -translate-x-1/2 rounded-2xl border border-slate-200 bg-white p-3 shadow-2xl shadow-slate-900/15">
                                    <div className="flex items-center justify-between rounded-xl bg-slate-50 px-2 py-2">
                                        <button
                                            type="button"
                                            onClick={() => shiftYear(-1)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-teal-700"
                                            aria-label="Previous year"
                                        >
                                            <i className="fa-solid fa-chevron-left text-xs" aria-hidden="true"></i>
                                        </button>
                                        <span className="text-sm font-bold text-slate-900">
                                            {monthDate.getFullYear()}
                                        </span>
                                        <button
                                            type="button"
                                            onClick={() => shiftYear(1)}
                                            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition-colors hover:bg-white hover:text-teal-700"
                                            aria-label="Next year"
                                        >
                                            <i className="fa-solid fa-chevron-right text-xs" aria-hidden="true"></i>
                                        </button>
                                    </div>

                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                        {MONTH_NAMES.map((monthName, index) => {
                                            const isSelected = index === monthDate.getMonth();

                                            return (
                                                <button
                                                    key={monthName}
                                                    type="button"
                                                    onClick={() => selectMonth(index)}
                                                    className={`rounded-xl border px-2 py-2 text-xs font-semibold transition-all ${
                                                        isSelected
                                                            ? "border-teal-300 bg-teal-500 text-white shadow-lg shadow-teal-500/25"
                                                            : "border-transparent bg-slate-50 text-slate-600 hover:border-teal-200 hover:bg-teal-50 hover:text-teal-700"
                                                    }`}
                                                >
                                                    {monthName}
                                                </button>
                                            );
                                        })}
                                    </div>

                                    <button
                                        type="button"
                                        onClick={selectCurrentMonth}
                                        className="mt-3 w-full rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-bold text-amber-700 transition-colors hover:bg-amber-100"
                                    >
                                        This month
                                    </button>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-sm text-slate-600 transition-colors hover:bg-slate-50 sm:h-11 sm:w-11 sm:text-base"
                        >
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2 sm:mt-5 sm:gap-3">
                {Object.entries(seriesMeta).map(([key, meta]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => toggleSeries(key)}
                        className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-colors sm:gap-2 sm:px-4 sm:py-2 sm:text-sm ${
                            visibleSeries[key]
                                ? meta.fill
                                : "border-slate-200 bg-white text-slate-500"
                        }`}
                    >
                        <span
                            className="h-2 w-2 rounded-full sm:h-2.5 sm:w-2.5"
                            style={{ backgroundColor: meta.stroke }}
                        ></span>
                        {meta.label}
                    </button>
                ))}
            </div>

            <div className="mt-5 rounded-3xl bg-slate-50 p-3 sm:mt-6 sm:p-5">
                <div className="relative h-56 w-full sm:h-72">
                    <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between text-[10px] text-slate-400 sm:text-xs">
                        {[4, 3, 2, 1, 0].map((tick) => (
                            <div key={tick} className="relative border-t border-dashed border-slate-200">
                                <span className="absolute -top-2 left-0 bg-slate-50 pr-2">
                                    {Math.round((maxValue / 4) * tick)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-x-7 top-3 bottom-8 overflow-hidden sm:inset-x-10">
                        <svg
                            viewBox="0 0 100 100"
                            preserveAspectRatio="none"
                            className="h-full w-full"
                        >
                            {activeKeys.length > 0 ? (
                                activeKeys.map((key) => (
                                    <g key={key}>
                                        <path
                                            d={buildPath(key)}
                                            fill="none"
                                            stroke={seriesMeta[key].stroke}
                                            strokeWidth="0.35"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </g>
                                ))
                            ) : null}
                        </svg>

                        <div className="absolute inset-0">
                            {activeKeys.map((key) =>
                                chartData.map((point, index) => {
                                    const position = getPointPosition(point, index, key);
                                    const isHovered =
                                        hoveredPoint?.key === key && hoveredPoint?.day === point.day;

                                    return (
                                        <button
                                            key={`${key}-${point.day}`}
                                            type="button"
                                            onMouseEnter={() =>
                                                setHoveredPoint({
                                                    key,
                                                    day: point.day,
                                                    value: point[key],
                                                    left: position.left,
                                                    top: position.top,
                                                })
                                            }
                                            onMouseLeave={() => setHoveredPoint(null)}
                                            className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 appearance-none rounded-full border-0 bg-transparent p-0 outline-none sm:h-5 sm:w-5"
                                            style={{
                                                left: `${position.left}%`,
                                                top: `${position.top}%`,
                                            }}
                                            aria-label={`${seriesMeta[key].label} on ${formatPointDate(point.day)}`}
                                        >
                                            <span
                                                className={`absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full transition-all duration-150 ${
                                                    isHovered ? "opacity-100 scale-100" : "opacity-0 scale-75"
                                                }`}
                                                style={{
                                                    background: `radial-gradient(circle, ${seriesMeta[key].stroke}2e 0%, ${seriesMeta[key].stroke}14 45%, transparent 75%)`,
                                                }}
                                                aria-hidden="true"
                                            ></span>
                                            <span
                                                className="absolute left-1/2 top-1/2 h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full border border-white shadow-sm"
                                                style={{
                                                    backgroundColor: seriesMeta[key].stroke,
                                                }}
                                                aria-hidden="true"
                                            ></span>
                                        </button>
                                    );
                                })
                            )}

                        </div>
                    </div>

                    <div className="pointer-events-none absolute inset-x-7 top-3 bottom-8 overflow-visible sm:inset-x-10">
                        {hoveredPoint && (
                            <div
                                className="absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900 px-2.5 py-2 text-[10px] font-medium text-white shadow-xl sm:px-3 sm:text-xs"
                                style={{
                                    left: `${hoveredPoint.left}%`,
                                    top: `calc(${hoveredPoint.top}% - 10px)`,
                                }}
                            >
                                <p>{formatPointDate(hoveredPoint.day)}</p>
                                <p className="mt-1 text-white/75">
                                    {seriesMeta[hoveredPoint.key].label}: {hoveredPoint.value}
                                </p>
                            </div>
                        )}
                    </div>

                    <div className="absolute inset-x-7 bottom-0 h-6 text-[7px] text-slate-500 sm:inset-x-10 sm:text-[9px]">
                        {chartData.map((point, index) => {
                            const { left } = getPointPosition(point, index, activeKeys[0] || "done");

                            return (
                                <span
                                    key={point.day}
                                    className="absolute top-0 -translate-x-1/2"
                                    style={{ left: `${left}%` }}
                                >
                                    {point.day}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {activeKeys.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-xs text-slate-500 sm:text-sm">
                        Select at least one series to view the chart.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyTaskLineChart;
