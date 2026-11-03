"use client";

import React, { useState, useEffect } from "react";
import {
    SHIFT_KEYS,
    calculateTotalHours,
    calculateWorkingDays,
    calculateTotalOff,
    calculateDailySummary,
    evaluateDutyCompliance,
    getDutyHoursCellClass,
} from "../utils/rosterCalculations";
import { getShiftStyle } from "../utils/shiftStyles";
import {
    generateWeekDaysAndDates,
    extractMonthFolder,
    formatToDDMMYYYY,
    getMondayOfWeek,
} from "../utils/dateUtils";
import { fetchWeeklyRoster } from "../utils/rosterService";
import { fetchAllUsers } from "../utils/userManagerService";
import { validateDutyOffRule, extractCOffUsageFromRoster, syncRosterCOffToDatabase } from "../utils/c-off";
import { generateSmartRoster } from "../utils/autoRosterEngine";
import CustomModal from "./CustomModal";

export default function RosterTable({
    isAdmin = false,
    onSaveRosterToCloud,
    savedWeeksList = [],
    onSelectWeekDate,
}) {
    const [currentMonday, setCurrentMonday] = useState(getMondayOfWeek(new Date()));
    const [weekDays, setWeekDays] = useState([]);
    const [rosterData, setRosterData] = useState([]);
    const [lastEditedAt, setLastEditedAt] = useState(null);
    const [isFetching, setIsFetching] = useState(false);

    // Auto-adjust click variation counter
    const [adjustSeed, setAdjustSeed] = useState(0);

    const [savedSnapshot, setSavedSnapshot] = useState("");
    const [draggedIdx, setDraggedIdx] = useState(null);
    const [selectedEmpFilter, setSelectedEmpFilter] = useState("ALL");

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalConfig, setModalConfig] = useState({
        title: "",
        message: "",
        action: null,
        isDanger: false,
    });

    const sortAZ = (list = []) => {
        return [...list].sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    };

    useEffect(() => {
        const days = generateWeekDaysAndDates(currentMonday);
        setWeekDays(days);

        const mondayDateStr = formatToDDMMYYYY(currentMonday);
        const monthFolder = extractMonthFolder(mondayDateStr);

        async function loadWeekWithLiveEmployees() {
            setIsFetching(true);
            const masterEmployees = await fetchAllUsers();
            const savedRes = await fetchWeeklyRoster(monthFolder, mondayDateStr);
            const savedRecords = savedRes.success && savedRes.data?.records ? savedRes.data.records : [];

            if (savedRecords.length > 0) {
                const merged = [];
                savedRecords.forEach((saved) => {
                    const master = masterEmployees.find((m) => m.empId === saved.empId);
                    merged.push({
                        ...saved,
                        name: master ? master.name : saved.name,
                        designation: master ? master.designation : saved.designation,
                    });
                });

                masterEmployees.forEach((master) => {
                    const alreadyIn = merged.some((m) => m.empId === master.empId);
                    if (!alreadyIn) {
                        merged.push({
                            empId: master.empId,
                            name: master.name,
                            designation: master.designation || "Documentation",
                            shifts: ["OFF", "OFF", "OFF", "OFF", "OFF", "OFF", "OFF"],
                        });
                    }
                });

                setRosterData(merged);
                setSavedSnapshot(JSON.stringify(merged));
                setLastEditedAt(savedRes.data?.updatedAtDisplay || null);
            } else {
                const defaultList = masterEmployees.map((emp) => ({
                    empId: emp.empId,
                    name: emp.name,
                    designation: emp.designation || "Documentation",
                    shifts: ["OFF", "OFF", "OFF", "OFF", "OFF", "OFF", "OFF"],
                }));
                const initialSorted = sortAZ(defaultList);
                setRosterData(initialSorted);
                setSavedSnapshot("");
                setLastEditedAt(null);
            }

            setIsFetching(false);
        }

        loadWeekWithLiveEmployees();
    }, [currentMonday]);

    // MULTI-CLICK AUTO ADJUST: Generates a brand-new variation on every click!
    const handleAutoAdjustRoster = () => {
        const nextSeed = adjustSeed + 1;
        setAdjustSeed(nextSeed);
        const adjusted = generateSmartRoster(rosterData, {}, nextSeed);
        setRosterData(adjusted);
    };

    const handleShiftChange = (actualEmpId, dayIndex, newShift) => {
        const updated = rosterData.map((emp) => {
            if (emp.empId === actualEmpId) {
                const newShifts = [...emp.shifts];
                newShifts[dayIndex] = newShift;
                return { ...emp, shifts: newShifts };
            }
            return emp;
        });
        setRosterData(updated);
    };

    const handleSortAZClick = () => {
        setRosterData(sortAZ(rosterData));
    };

    const moveEmployeeRow = (fromIndex, toIndex) => {
        if (toIndex < 0 || toIndex >= rosterData.length) return;
        const reordered = [...rosterData];
        const [movedItem] = reordered.splice(fromIndex, 1);
        reordered.splice(toIndex, 0, movedItem);
        setRosterData(reordered);
    };

    const onDragStart = (e, index) => {
        setDraggedIdx(index);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
    };

    const onDrop = (e, targetIdx) => {
        e.preventDefault();
        if (draggedIdx === null || draggedIdx === targetIdx) return;
        moveEmployeeRow(draggedIdx, targetIdx);
        setDraggedIdx(null);
    };

    const navigateWeek = (offsetWeeks) => {
        const nextMonday = new Date(currentMonday);
        nextMonday.setDate(nextMonday.getDate() + offsetWeeks * 7);
        setCurrentMonday(nextMonday);
    };

    const handleDirectDateJump = (e) => {
        if (!e.target.value) return;
        const picked = new Date(e.target.value);
        const targetMonday = getMondayOfWeek(picked);
        setCurrentMonday(targetMonday);
    };

    const triggerClearModal = () => {
        setModalConfig({
            title: "Reset Weekly Shifts",
            message: "Are you sure you want to reset all shift assignments for this week to OFF?",
            isDanger: true,
            action: () => {
                const cleared = rosterData.map((emp) => ({
                    ...emp,
                    shifts: Array(7).fill("OFF"),
                }));
                setRosterData(cleared);
                setIsModalOpen(false);
            },
        });
        setIsModalOpen(true);
    };

    const triggerSaveModal = () => {
        const mondayDateStr = formatToDDMMYYYY(currentMonday);
        const monthFolder = extractMonthFolder(mondayDateStr);

        setModalConfig({
            title: "Save & Publish Roster",
            message: `Publish updates for week starting ${mondayDateStr}?`,
            isDanger: false,
            action: async () => {
                try {
                    const availedCOffs = extractCOffUsageFromRoster(rosterData, weekDays);
                    if (availedCOffs.length > 0) {
                        await syncRosterCOffToDatabase(availedCOffs);
                    }

                    if (onSaveRosterToCloud) {
                        await onSaveRosterToCloud(monthFolder, mondayDateStr, rosterData);
                        setSavedSnapshot(JSON.stringify(rosterData));
                    }
                } catch (err) {
                    console.error("Save error:", err);
                } finally {
                    setIsModalOpen(false);
                }
            },
        });
        setIsModalOpen(true);
    };

    const dailySummary = calculateDailySummary(rosterData);
    const mondayDateStr = formatToDDMMYYYY(currentMonday);
    const activeMonthFolder = extractMonthFolder(mondayDateStr);

    const displayedEmployees =
        selectedEmpFilter === "ALL"
            ? rosterData
            : rosterData.filter((emp) => emp.empId === selectedEmpFilter);

    const canReorder = isAdmin && selectedEmpFilter === "ALL";

    const hasChanges = savedSnapshot
        ? JSON.stringify(rosterData) !== savedSnapshot
        : true;

    return (
        <div className="w-full border-2 border-panel-border bg-panel-bg p-2 sm:p-4 shadow-md font-mono select-none">
            {/* 2-Tier Clean Header Toolbar */}
            <div className="border-b-2 border-panel-border pb-3 mb-3 space-y-2.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h2 className="text-sm sm:text-base font-black uppercase tracking-wide text-header-bg whitespace-nowrap">
                            Weekly Deployment - Documentation
                        </h2>
                        <span className="bg-[#1E3A2E] text-white text-[10px] px-2 py-0.5 font-bold">
                            Folder: {activeMonthFolder}
                        </span>
                        {lastEditedAt ? (
                            <span className="bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB] px-1.5 py-0.2 text-[10px] font-black">
                                🕒 Last Edited: {lastEditedAt}
                            </span>
                        ) : (
                            <span className="bg-[#FFF3CD] text-[#856404] px-1.5 py-0.2 text-[10px] font-bold">
                                ⚠️ New / Unsaved Draft
                            </span>
                        )}
                    </div>

                    {isAdmin && (
                        <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                                onClick={triggerClearModal}
                                className="retro-button bg-[#8B2626] text-white px-3 py-1 text-xs font-bold cursor-pointer"
                            >
                                Clear
                            </button>

                            <button
                                onClick={triggerSaveModal}
                                disabled={!hasChanges}
                                className={`retro-button px-4 py-1 text-xs font-bold ${hasChanges
                                        ? "bg-[#1E3A2E] text-white cursor-pointer active:translate-y-px"
                                        : "bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed opacity-60"
                                    }`}
                            >
                                {hasChanges ? "Save & Publish" : "Published ✓"}
                            </button>
                        </div>
                    )}
                </div>

                {/* Tier 2: Controls */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1.5 border-t border-panel-border/30 text-xs">
                    <div className="flex items-center gap-2">
                        <span className="text-[11px] font-bold text-retro-sage">Active Week:</span>
                        <div className="flex items-center border border-panel-border bg-white">
                            <button
                                onClick={() => navigateWeek(-1)}
                                className="retro-button px-2.5 py-1 font-black bg-panel-bg text-app-text cursor-pointer"
                            >
                                ◀ Prev
                            </button>

                            <div className="relative flex items-center px-2 border-x border-panel-border bg-[#F5F7F0]">
                                <span className="font-black text-[11px] text-[#0F1F17] mr-1">{mondayDateStr}</span>
                                <input
                                    type="date"
                                    onChange={handleDirectDateJump}
                                    title="Click to jump directly to any date/week in 1-click"
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

                    <div className="flex flex-wrap items-center gap-2">
                        <div className="flex items-center gap-1 bg-white border border-panel-border px-2 py-0.5 text-xs">
                            <label className="font-bold text-gray-700">Filter:</label>
                            <select
                                value={selectedEmpFilter}
                                onChange={(e) => setSelectedEmpFilter(e.target.value)}
                                className="bg-transparent font-bold outline-none cursor-pointer"
                            >
                                <option value="ALL">All Personnel ({rosterData.length})</option>
                                {rosterData.map((emp) => (
                                    <option key={emp.empId} value={emp.empId}>
                                        {emp.empId} - {emp.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {isAdmin && (
                            <button
                                onClick={handleSortAZClick}
                                className="retro-button bg-[#C7CBB8] text-[#0F1F17] border border-[#3D4337] px-2 py-1 text-xs font-black cursor-pointer hover:bg-black/10"
                                title="Align employees A to Z"
                            >
                                🔤 Sort A-Z
                            </button>
                        )}

                        {/* ⚡ MULTI-CLICK AUTO ADJUST BUTTON */}
                        {isAdmin && (
                            <button
                                onClick={handleAutoAdjustRoster}
                                disabled={!hasChanges}
                                className={`retro-button px-2.5 py-1 text-xs font-black ${hasChanges
                                        ? "bg-[#0F4C5C] text-white cursor-pointer hover:bg-[#0B3A46] active:translate-y-px"
                                        : "bg-gray-400 text-gray-200 border-gray-500 cursor-not-allowed opacity-60"
                                    }`}
                                title="Click to generate or cycle through balanced 48h shift schedules"
                            >
                                ⚡ Auto Adjust
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Grid Table */}
            <div className="overflow-x-auto border border-table-border shadow-inner">
                <table className="w-full border-collapse text-xs">
                    <thead>
                        <tr className="bg-header-bg text-header-text uppercase text-[11px]">
                            <th rowSpan={2} className="border border-table-border p-1.5 w-14 text-center">
                                {canReorder ? "Move / Sl" : "Sl"}
                            </th>
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
                            <th rowSpan={2} className="border border-table-border p-1 text-center min-w-[130px] bg-[#1E3A2E]">Remarks</th>
                        </tr>
                        <tr className="bg-[#1E3A2E] text-white text-[10px]">
                            {weekDays.map((d, i) => (
                                <th key={i} className="border border-table-border p-1 text-center">{d.dayName}</th>
                            ))}
                        </tr>
                    </thead>

                    <tbody>
                        {isFetching ? (
                            <tr>
                                <td colSpan={15} className="retro-cell text-center py-6 text-gray-500 font-bold">
                                    Syncing live employee roster...
                                </td>
                            </tr>
                        ) : displayedEmployees.length === 0 ? (
                            <tr>
                                <td colSpan={15} className="retro-cell text-center py-6 text-gray-500 italic">
                                    No employees found. Please add personnel via Admin Tools &gt; Manage Users.
                                </td>
                            </tr>
                        ) : (
                            displayedEmployees.map((emp, empIdx) => {
                                const totalHrs = calculateTotalHours(emp.shifts);
                                const workingDays = calculateWorkingDays(emp.shifts);
                                const totalOff = calculateTotalOff(emp.shifts);
                                const compliance = evaluateDutyCompliance(totalHrs);
                                const ruleCheck = validateDutyOffRule(emp.shifts);

                                const isBeingDragged = draggedIdx === empIdx;

                                return (
                                    <tr
                                        key={emp.empId || empIdx}
                                        draggable={canReorder}
                                        onDragStart={(e) => onDragStart(e, empIdx)}
                                        onDragOver={onDragOver}
                                        onDrop={(e) => onDrop(e, empIdx)}
                                        className={`transition-none ${isBeingDragged
                                                ? "opacity-40 bg-[#FFF3CD]"
                                                : empIdx % 2 === 0
                                                    ? "bg-table-row-even"
                                                    : "bg-table-row-odd"
                                            } ${canReorder ? "hover:bg-black/5" : ""}`}
                                    >
                                        <td className="retro-cell text-center font-bold">
                                            <div className="flex items-center justify-center gap-1">
                                                {canReorder && (
                                                    <div className="flex flex-col text-[8px] leading-tight text-gray-600">
                                                        <button
                                                            type="button"
                                                            onClick={() => moveEmployeeRow(empIdx, empIdx - 1)}
                                                            disabled={empIdx === 0}
                                                            className="hover:text-black disabled:opacity-20 cursor-pointer active:scale-95"
                                                            title="Move Row Up"
                                                        >
                                                            ▲
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => moveEmployeeRow(empIdx, empIdx + 1)}
                                                            disabled={empIdx === displayedEmployees.length - 1}
                                                            className="hover:text-black disabled:opacity-20 cursor-pointer active:scale-95"
                                                            title="Move Row Down"
                                                        >
                                                            ▼
                                                        </button>
                                                    </div>
                                                )}
                                                <span className={canReorder ? "cursor-grab active:cursor-grabbing font-black" : ""}>
                                                    {empIdx + 1}
                                                </span>
                                            </div>
                                        </td>

                                        <td className="retro-cell text-center font-bold">{emp.empId}</td>

                                        <td className="retro-cell text-center font-bold sticky left-0 bg-inherit z-10 shadow-[1px_0_0_0_#3D4337]">
                                            {emp.name}
                                        </td>

                                        <td className="retro-cell text-center text-[10px] hidden md:table-cell text-gray-700 font-semibold">
                                            {emp.designation || "Documentation"}
                                        </td>

                                        {emp.shifts.map((shift, dayIdx) => (
                                            <td key={dayIdx} className="retro-cell p-0.5 text-center">
                                                {isAdmin ? (
                                                    <select
                                                        value={shift}
                                                        onChange={(e) => handleShiftChange(emp.empId, dayIdx, e.target.value)}
                                                        className={`w-full py-1 text-center font-bold outline-none cursor-pointer ${getShiftStyle(shift)}`}
                                                    >
                                                        {SHIFT_KEYS.map((key) => (
                                                            <option key={key} value={key} className="bg-white text-black">
                                                                {key}
                                                            </option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    <div className={`py-1 text-center ${getShiftStyle(shift)}`}>
                                                        {shift}
                                                    </div>
                                                )}
                                            </td>
                                        ))}

                                        <td className={`retro-cell text-center text-xs ${getDutyHoursCellClass(totalHrs)}`}>
                                            {totalHrs}
                                        </td>
                                        <td className="retro-cell font-bold text-center text-[#1E3A2E]">{workingDays}</td>
                                        <td className="retro-cell font-bold text-center text-[#7F1D1D]">{totalOff}</td>

                                        <td className="retro-cell text-center text-[10px] font-bold">
                                            {!ruleCheck.isCompliant ? (
                                                <span className="text-red-700 block">⚠️ Off Rule Non-compliant</span>
                                            ) : (
                                                <span className={compliance.isOverDuty ? "text-[#721C24]" : compliance.isUnderDuty ? "text-[#856404]" : "text-[#155724]"}>
                                                    {compliance.remark}
                                                </span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })
                        )}
                    </tbody>

                    {/* Footer Summaries */}
                    <tfoot>
                        <tr className="bg-black/10 font-bold border-t-2 border-table-border">
                            <td className="retro-cell"></td>
                            <td className="retro-cell"></td>
                            <td className="retro-cell text-center font-black sticky left-0 bg-[#D6DACB] z-10 shadow-[1px_0_0_0_#3D4337]">
                                Total A:
                            </td>
                            <td className="hidden md:table-cell retro-cell"></td>
                            {dailySummary.totalA.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalB.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalC.map((val, idx) => (
                                <td key={idx} className={`retro-cell font-black ${val === 0 ? "bg-[#F8D7DA] text-red-700" : ""}`}>{val}</td>
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
                            {dailySummary.totalG.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalD.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalN.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalDay.map((val, idx) => (
                                <td key={idx} className="retro-cell font-black">{val}</td>
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
                            {dailySummary.totalNight.map((val, idx) => (
                                <td key={idx} className={`retro-cell ${val === 0 ? "bg-[#8B2626] text-white" : ""}`}>{val}</td>
                            ))}
                            <td colSpan={4} className="retro-cell"></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <CustomModal
                isOpen={isModalOpen}
                title={modalConfig.title}
                message={modalConfig.message}
                isDanger={modalConfig.isDanger}
                onConfirm={modalConfig.action}
                onCancel={() => setIsModalOpen(false)}
            />
        </div>
    );
}