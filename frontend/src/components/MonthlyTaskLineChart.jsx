import React, { useMemo, useState } from "react";

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
    const [visibleSeries, setVisibleSeries] = useState({
        done: true,
        undone: true,
        overdue: true,
    });
    const [hoveredPoint, setHoveredPoint] = useState(null);

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
        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Monthly Stats
                    </p>
                    <h2 className="mt-1 text-2xl font-bold text-slate-900">
                        Daily task trend for the selected month
                    </h2>
                    <p className="mt-2 text-sm text-slate-500">
                        Track completed, undone, and overdue tasks day by day.
                    </p>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={() => shiftMonth(-1)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <i className="fa-solid fa-chevron-left" aria-hidden="true"></i>
                        </button>

                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(event) => setSelectedMonth(event.target.value)}
                            className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 outline-none transition-colors focus:border-teal-300"
                        />

                        <button
                            type="button"
                            onClick={() => shiftMonth(1)}
                            className="flex h-11 w-11 items-center justify-center rounded-xl border border-slate-200 text-slate-600 transition-colors hover:bg-slate-50"
                        >
                            <i className="fa-solid fa-chevron-right" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div className="mt-5 flex flex-wrap gap-3">
                {Object.entries(seriesMeta).map(([key, meta]) => (
                    <button
                        key={key}
                        type="button"
                        onClick={() => toggleSeries(key)}
                        className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                            visibleSeries[key]
                                ? meta.fill
                                : "border-slate-200 bg-white text-slate-500"
                        }`}
                    >
                        <span
                            className="h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: meta.stroke }}
                        ></span>
                        {meta.label}
                    </button>
                ))}
            </div>

            <div className="mt-6 rounded-3xl bg-slate-50 p-4 sm:p-5">
                <div className="relative h-72 w-full">
                    <div className="absolute inset-x-0 top-0 bottom-8 flex flex-col justify-between text-xs text-slate-400">
                        {[4, 3, 2, 1, 0].map((tick) => (
                            <div key={tick} className="relative border-t border-dashed border-slate-200">
                                <span className="absolute -top-2 left-0 bg-slate-50 pr-2">
                                    {Math.round((maxValue / 4) * tick)}
                                </span>
                            </div>
                        ))}
                    </div>

                    <div className="absolute inset-x-10 top-3 bottom-8 overflow-hidden">
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
                                            className="absolute h-5 w-5 -translate-x-1/2 -translate-y-1/2 appearance-none rounded-full border-0 bg-transparent p-0 outline-none"
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

                    <div className="pointer-events-none absolute inset-x-10 top-3 bottom-8 overflow-visible">
                        {hoveredPoint && (
                            <div
                                className="absolute z-20 -translate-x-1/2 -translate-y-full rounded-xl bg-slate-900 px-3 py-2 text-xs font-medium text-white shadow-xl"
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

                    <div className="absolute inset-x-10 bottom-0 h-6 text-[11px] text-slate-500">
                        {chartData.map((point, index) => {
                            const { left } = getPointPosition(point, index, activeKeys[0] || "done");

                            return (
                                <span
                                    key={point.day}
                                    className="absolute top-full -translate-x-1/2 translate-y-1"
                                    style={{ left: `${left}%` }}
                                >
                                    {point.day}
                                </span>
                            );
                        })}
                    </div>
                </div>

                {activeKeys.length === 0 && (
                    <div className="mt-4 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                        Select at least one series to view the chart.
                    </div>
                )}
            </div>
        </div>
    );
};

export default MonthlyTaskLineChart;
