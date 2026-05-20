import React from "react";
import MonthlyTaskLineChart from "./MonthlyTaskLineChart";

const MonthlyStatsModal = ({ open, onClose, tasks = [] }) => {
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
                    aria-label="Close monthly stats"
                >
                    <i className="fa-solid fa-xmark text-xl" aria-hidden="true"></i>
                </button>

                <div className="border-b border-slate-200 bg-white px-6 py-5 sm:px-8">
                    <div className="flex flex-col gap-3 pr-12 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className="text-sm font-semibold uppercase tracking-[0.24em] text-teal-500">
                                Monthly Stats
                            </p>
                            
                        </div>
                        
                    </div>
                </div>

                <div className="overflow-y-auto p-6 sm:p-8">
                    <MonthlyTaskLineChart tasks={tasks} />
                </div>
            </div>
        </div>
    );
};

export default MonthlyStatsModal;
