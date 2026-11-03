"use client";

import React, { useState, useEffect } from "react";
import { fetchWeeklyRoster } from "../utils/rosterService";
import {
    generateWeekDaysAndDates,
    extractMonthFolder,
    formatToDDMMYYYY,
    getMondayOfWeek,
    parseDDMMYYYY,
} from "../utils/dateUtils";
import {
    calculateTotalHours,
    calculateWorkingDays,
    calculateTotalOff,
    calculateDailySummary,
    evaluateDutyCompliance,
    getDutyHoursCellClass,
} from "../utils/rosterCalculations";
import { getShiftStyle } from "../utils/shiftStyles";
import NoticeBoard from "./NoticeBoard";
import WorkingScheduleModal from "./WorkingScheduleModal";
import ExportRosterModal from "./ExportRosterModal";

export default function LiveDashboard({
    savedWeeks = [],
    onOpenBuilderForWeek,
}) {
    const [selectedMonday, setSelectedMonday] = useState(getMondayOfWeek(new Date()));
    const [weekDays, setWeekDays] = useState([]);
    const [rosterRecords, setRosterRecords] = useState([]);
    const [lastEditedAt, setLastEditedAt] = useState(null);
    const [loading, setLoading] = useState(false);

    const [isScheduleOpen, setIsScheduleOpen] = useState(false);
    const [isExportOpen, setIsExportOpen] = useState(false);
    const [selectedEmpFilter, setSelectedEmpFilter] = useState("ALL");

    const mondayStr = formatToDDMMYYYY(selectedMonday);
    const monthFolder = extractMonthFolder(mondayStr);

    useEffect(() => {
        const days = generateWeekDaysAndDates(selectedMonday);
        setWeekDays(days);
        loadPublishedRoster(monthFolder, mondayStr);
    }, [selectedMonday]);

    const loadPublishedRoster = async (folder, dateStr) => {
        setLoading(true);
        const res = await fetchWeeklyRoster(folder, dateStr);
        if (res.success && res.data?.records) {
            setRosterRecords(res.data.records);
            setLastEditedAt(res.data.updatedAtDisplay || "Live in Cloud");
        } else {
            setRosterRecords([]);
            setLastEditedAt(null);
        }
        setLoading(false);
    };

    const navigateWeek = (offset) => {
        const next = new Date(selectedMonday);
        next.setDate(next.getDate() + offset * 7);
        setSelectedMonday(next);
    };

    const handleDirectDateJump = (e) => {
        if (!e.target.value) return;
        const picked = new Date(e.target.value);
        const targetMonday = getMondayOfWeek(picked);
        setSelectedMonday(targetMonday);
    };

    const handleArchiveClick = (weekDateStr) => {
        const targetMonday = parseDDMMYYYY(weekDateStr);
        setSelectedMonday(targetMonday);
    };

    const dailySummary = calculateDailySummary(rosterRecords);

    const displayedRecords =
        selectedEmpFilter === "ALL"
            ? rosterRecords
            : rosterRecords.filter((emp) => emp.empId === selectedEmpFilter);

    return (
        <div className="space-y-4 font-mono select-none">
            <div className="w-full border-2 border-panel-border bg-panel-bg p-2 sm:p-4 shadow-md">
                {/* Header Bar */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-b-2 border-panel-border pb-3 mb-3 gap-2">
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-sm sm:text-base font-black uppercase text-header-bg">
                                Official Deployment - Documentation
                            </h2>
                            <span className="bg-[#1E3A2E] text-white text-[10px] px-2 py-0.5 font-bold">
                                Month: {monthFolder}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 mt-1 text-xs">
                            <span className="text-retro-sage font-bold">Week: {mondayStr}</span>
                            {lastEditedAt && (
                                <span className="bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB] px-1.5 py-0.2 text-[10px] font-black">
                                    🕒 Last Updated: {lastEditedAt}
                                </span>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                        {rosterRecords.length > 0 && (
                            <div className="flex items-center gap-1 bg-white border border-panel-border px-2 py-1 text-xs">
                                <label className="font-bold text-gray-700">Filter:</label>
                                <select
                                    value={selectedEmpFilter}
                                    onChange={(e) => setSelectedEmpFilter(e.target.value)}
                                    className="bg-transparent font-bold outline-none cursor-pointer"
                                >
                                    <option value="ALL">All ({rosterRecords.length})</option>
                                    {rosterRecords.map((r) => (
                                        <option key={r.empId} value={r.empId}>
                                            {r.empId} - {r.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <button
                            onClick={() => setIsExportOpen(true)}
                            disabled={rosterRecords.length === 0}
                            className="retro-button bg-[#1E3A2E] text-white px-2.5 py-1 text-xs font-bold cursor-pointer disabled:bg-gray-400"
                        >
                            📥 Export Excel
                        </button>

                        <button
                            onClick={() => setIsScheduleOpen(true)}
                            className="retro-button bg-panel-bg text-app-text px-2.5 py-1 text-xs font-bold cursor-pointer"
                        >
                            ⏰ Shift Timings Guide
                        </button>

                        {/* DIRECT JUMP ON LIVE DASHBOARD */}
                        <div className="flex items-center border border-panel-border bg-white text-xs">
                            <button
                                onClick={() => navigateWeek(-1)}
                                className="retro-button px-2.5 py-1 font-black bg-panel-bg text-app-text cursor-pointer"
                            >
                                ◀ Prev
                            </button>

                            <div className="relative flex items-center px-2 border-x border-panel-border bg-[#F5F7F0]">
                                <span className="font-black text-[11px] text-[#0F1F17] mr-1">{mondayStr}</span>
                                <input
                                    type="date"
                                    onChange={handleDirectDateJump}
                                    title="Click to jump directly to any date in 1-click"
                                    className="w-5 h-5 opacity-40 hover:opacity-100 cursor-pointer"
                                />
                            </div>

                            <button
                                onClick={() => navigateWeek(1)}
                                className="retro-button px-2.5 py-1 font-black bg-panel-bg text-app-text cursor-pointer"
                            >
                                Next ▶
                            </button>
                        </div>
                    </div>
                </div>

                {/* Live Grid */}
                <div className="overflow-x-auto border border-table-border shadow-inner">
                    <table className="w-full border-collapse text-xs">
                        <thead>
                            <tr className="bg-header-bg text-header-text uppercase text-[11px]">
                                <th rowSpan={2} className="border border-table-border p-1.5 w-10 text-center">Sl</th>
                                <th rowSpan={2} className="border border-table-border p-1.5 w-16 text-center">Emp ID</th>
                                <th rowSpan={2} className="border border-table-border p-1.5 min-w-[160px] text-center sticky left-0 bg-header-bg z-20 shadow-[1px_0_0_0_#3D4337]">
                                    Employee Name
                                </th>
                                <th rowSpan={2} className="border border-table-border p-1.5 min-w-[140px] text-center hidden md:table-cell">
                                    Designation
                                </th>
                                {weekDays.map((d, i) => (
                                    <th key={i} className="border border-table-border p-1 text-center min-w-[70px]">{d.displayDate}</th>
                                ))}
                                <th rowSpan={2} className="border border-table-border p-1 text-center w-14 bg-[#1E3A2E]">Hrs</th>
                                <th rowSpan={2} className="border border-table-border p-1 text-center w-12 bg-[#1E3A2E]">Days</th>
                                <th rowSpan={2} className="border border-table-border p-1 text-center w-12 bg-[#1E3A2E]">Off</th>
                                <th rowSpan={2} className="border border-table-border p-1 text-center min-w-[120px] bg-[#1E3A2E]">Status</th>
                            </tr>
                            <tr className="bg-[#1E3A2E] text-white text-[10px]">
                                {weekDays.map((d, i) => (
                                    <th key={i} className="border border-table-border p-1 text-center">{d.dayName}</th>
                                ))}
                            </tr>
                        </thead>

                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={15} className="retro-cell text-center py-6 text-gray-500 font-bold">
                                        Fetching latest published roster from cloud...
                                    </td>
                                </tr>
                            ) : displayedRecords.length === 0 ? (
                                <tr>
                                    <td colSpan={15} className="retro-cell text-center py-8 text-gray-600 bg-white/40">
                                        <p className="font-bold mb-2">No deployment has been published for week {mondayStr} yet.</p>
                                        {onOpenBuilderForWeek && (
                                            <button
                                                onClick={() => onOpenBuilderForWeek(selectedMonday)}
                                                className="retro-button bg-[#1E3A2E] text-white px-3 py-1 font-bold cursor-pointer"
                                            >
                                                ✏️ Open Roster Builder for this Week
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ) : (
                                displayedRecords.map((emp, idx) => {
                                    const totalHrs = calculateTotalHours(emp.shifts);
                                    const workingDays = calculateWorkingDays(emp.shifts);
                                    const totalOff = calculateTotalOff(emp.shifts);
                                    const compliance = evaluateDutyCompliance(totalHrs);

                                    return (
                                        <tr key={emp.empId || idx} className={idx % 2 === 0 ? "bg-table-row-even" : "bg-table-row-odd"}>
                                            <td className="retro-cell font-bold text-center">{idx + 1}</td>
                                            <td className="retro-cell text-center font-bold">{emp.empId}</td>
                                            <td className="retro-cell text-center font-bold sticky left-0 bg-inherit z-10 shadow-[1px_0_0_0_#3D4337]">
                                                {emp.name}
                                            </td>
                                            <td className="retro-cell text-center text-[10px] hidden md:table-cell text-gray-700 font-semibold">
                                                {emp.designation || "Documentation"}
                                            </td>
                                            {emp.shifts.map((shift, sIdx) => (
                                                <td key={sIdx} className="retro-cell p-1 text-center">
                                                    <span className={`inline-block w-full py-0.5 rounded-none font-bold text-xs ${getShiftStyle(shift)}`}>
                                                        {shift}
                                                    </span>
                                                </td>
                                            ))}
                                            <td className={`retro-cell text-center text-xs ${getDutyHoursCellClass(totalHrs)}`}>
                                                {totalHrs}
                                            </td>
                                            <td className="retro-cell font-bold text-center text-[#1E3A2E]">{workingDays}</td>
                                            <td className="retro-cell font-bold text-center text-[#7F1D1D]">{totalOff}</td>
                                            <td className="retro-cell text-center text-[10px] font-bold">
                                                <span className={compliance.isOverDuty ? "text-[#721C24]" : compliance.isUnderDuty ? "text-[#856404]" : "text-[#155724]"}>
                                                    {compliance.remark}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>

                        {/* Footer Summaries */}
                        {rosterRecords.length > 0 && (
                            <tfoot>
                                <tr className="bg-black/10 font-bold border-t-2 border-table-border">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total A:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalA.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-black/10 font-bold">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total B:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalB.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-black/10 font-bold">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total C:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalC.map((v, i) => (
                                        <td key={i} className={`retro-cell font-black ${v === 0 ? "bg-[#F8D7DA] text-red-700" : ""}`}>{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-black/10 font-bold">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total G:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalG.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-black/10 font-bold">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total D:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalD.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-black/10 font-bold">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total N:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalN.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell bg-black/5"></td>
                                </tr>

                                <tr className="bg-[#1E3A2E] text-white font-black">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center sticky left-0 bg-[#1E3A2E] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total Day:
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalDay.map((v, i) => (
                                        <td key={i} className="retro-cell font-black">{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell"></td>
                                </tr>

                                <tr className="bg-[#0F1F17] text-white font-black">
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell"></td>
                                    <td className="retro-cell text-center sticky left-0 bg-[#0F1F17] z-10 shadow-[1px_0_0_0_#3D4337]">
                                        Total Night (C+N):
                                    </td>
                                    <td className="hidden md:table-cell retro-cell"></td>
                                    {dailySummary.totalNight.map((v, i) => (
                                        <td key={i} className={`retro-cell ${v === 0 ? "bg-[#8B2626] text-white" : ""}`}>{v}</td>
                                    ))}
                                    <td colSpan={4} className="retro-cell"></td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>

                {/* Chronological Archives */}
                <div className="flex items-center gap-1 overflow-x-auto border-t-2 border-panel-border pt-2 mt-3 text-xs">
                    <span className="font-bold text-[10px] text-gray-600 uppercase mr-1">Archives:</span>
                    {savedWeeks.map((w) => (
                        <button
                            key={w}
                            onClick={() => handleArchiveClick(w)}
                            className={`retro-button px-2 py-0.5 text-[11px] font-bold whitespace-nowrap cursor-pointer ${w === mondayStr ? "bg-[#1E3A2E] text-white" : "bg-[#EBEFE4] text-retro-text"
                                }`}
                        >
                            📅 {w}
                        </button>
                    ))}
                </div>
            </div>

            <div id="notice-board-section">
                <NoticeBoard isAdmin={false} />
            </div>

            <WorkingScheduleModal
                isOpen={isScheduleOpen}
                onClose={() => setIsScheduleOpen(false)}
            />

            <ExportRosterModal
                isOpen={isExportOpen}
                onClose={() => setIsExportOpen(false)}
                currentWeekDate={mondayStr}
                weekDays={weekDays}
                rosterRecords={rosterRecords}
            />
        </div>
    );
}