"use client";

import React from "react";
import { WORKING_SCHEDULE_LEGEND } from "../utils/shiftStyles";

export default function WorkingSchedule({ className = "" }) {
    // Split into Duty Shifts and Off/Leave shifts to eliminate vertical height
    const dutyShifts = WORKING_SCHEDULE_LEGEND.filter((s) => s.hrs > 0);
    const offShifts = WORKING_SCHEDULE_LEGEND.filter((s) => s.hrs === 0);

    return (
        <div className={`w-full border-2 border-panel-border bg-panel-bg shadow-md font-mono select-none ${className}`}>
            {/* Title Bar spanning 100% width */}
            <div className="bg-header-bg px-3 py-2 text-header-text flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b-2 border-table-border">
                <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider">
                        Department Working Schedule & Shift Guidelines Master
                    </h3>
                    <p className="text-[10px] text-gray-300">
                        Standard duty window allocation: 7h, 9h, 10h, and 12h rotation coverage
                    </p>
                </div>
                <span className="text-[10px] bg-[#1E3A2E] text-white px-2 py-0.5 border border-white/30 font-bold self-start sm:self-auto">
                    Active Shifts: 11
                </span>
            </div>

            {/* Wide 2-Column Parallel Grid Layout (Side-by-Side) */}
            <div className="p-3 grid grid-cols-1 lg:grid-cols-2 gap-3 bg-[#D6DACB]">
                {/* Left Column: Active Working Shifts */}
                <div className="border border-table-border bg-white shadow-inner">
                    <div className="bg-[#1E3A2E] text-white px-2 py-1 text-[11px] font-black uppercase text-center border-b border-table-border">
                        ⚙️ Operational Duty Shifts (Working Hours)
                    </div>
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-black/10 text-retro-text text-[10px] uppercase font-bold">
                                <th className="border border-table-border p-1.5 text-center w-14">Shift</th>
                                <th className="border border-table-border p-1.5 text-center min-w-[120px]">Timings</th>
                                <th className="border border-table-border p-1.5 text-center w-16">Hours</th>
                                <th className="border border-table-border p-1.5 text-left">Guidelines</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dutyShifts.map((item, idx) => {
                                let note = "Standard rotation";
                                if (item.code === "A") note = "Morning documentation & inward dispatch";
                                else if (item.code === "B") note = "Afternoon operational handover & billing";
                                else if (item.code === "C") note = "Night documentation (10 Hours duty)";
                                else if (item.code === "G") note = "General office shift (9am to 6pm)";
                                else if (item.code === "D") note = "Day extended rotation (12 Hours duty)";
                                else if (item.code === "N") note = "Night extended rotation (12 Hours duty)";

                                return (
                                    <tr
                                        key={item.code}
                                        className={idx % 2 === 0 ? "bg-table-row-even" : "bg-table-row-odd"}
                                    >
                                        <td className="retro-cell text-center p-1">
                                            <span className={`inline-block px-2.5 py-0.5 text-xs font-black ${item.badgeClass}`}>
                                                {item.code}
                                            </span>
                                        </td>
                                        <td className="retro-cell text-center font-bold text-app-text p-1">
                                            {item.time}
                                        </td>
                                        <td className="retro-cell text-center font-black text-[#1E3A2E] p-1">
                                            {item.hrs}h
                                        </td>
                                        <td className="retro-cell text-left text-gray-700 text-[11px] p-1">
                                            {note}
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Right Column: Offs & Leaves */}
                <div className="border border-table-border bg-white shadow-inner flex flex-col justify-between">
                    <div>
                        <div className="bg-[#3E5A3F] text-white px-2 py-1 text-[11px] font-black uppercase text-center border-b border-table-border">
                            🏖️ Weekly Offs & Entitlement Leaves
                        </div>
                        <table className="w-full border-collapse text-xs">
                            <thead>
                                <tr className="bg-black/10 text-retro-text text-[10px] uppercase font-bold">
                                    <th className="border border-table-border p-1.5 text-center w-14">Code</th>
                                    <th className="border border-table-border p-1.5 text-center min-w-[120px]">Type</th>
                                    <th className="border border-table-border p-1.5 text-center w-16">Hours</th>
                                    <th className="border border-table-border p-1.5 text-left">Guidelines</th>
                                </tr>
                            </thead>
                            <tbody>
                                {offShifts.map((item, idx) => {
                                    let note = "Non-working status";
                                    if (item.code === "C-OFF") note = "Compensatory Off against overtime/holiday";
                                    else if (item.code === "OFF") note = "Mandatory Weekly Rest Day";
                                    else if (item.code === "VL") note = "Vacation Leave (Authorized)";
                                    else if (item.code === "SL") note = "Sick Leave (Medical sanction)";
                                    else if (item.code === "Absent") note = "Unscheduled absence without sanction";

                                    return (
                                        <tr
                                            key={item.code}
                                            className={idx % 2 === 0 ? "bg-table-row-even" : "bg-table-row-odd"}
                                        >
                                            <td className="retro-cell text-center p-1">
                                                <span className={`inline-block px-2 py-0.5 text-xs font-black ${item.badgeClass}`}>
                                                    {item.code}
                                                </span>
                                            </td>
                                            <td className="retro-cell text-center font-bold text-app-text p-1">
                                                {item.code}
                                            </td>
                                            <td className="retro-cell text-center font-bold text-gray-500 p-1">
                                                0h
                                            </td>
                                            <td className="retro-cell text-left text-gray-700 text-[11px] p-1">
                                                {note}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>

                    <div className="p-2 border-t border-table-border bg-[#F5F7F0] text-[10px] text-gray-600 font-bold text-center">
                        📌 Rule: 4 Days 12h Duty requires 3 Days Off | 6 Days Duty requires 1 Day Off
                    </div>
                </div>
            </div>
        </div>
    );
}