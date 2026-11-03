"use client";

import React, { useState, useEffect, useRef } from "react";
import { getAllEmployeesCOffSummary } from "../utils/c-off";
import { fetchAllUsers } from "../utils/userManagerService";
import SetOpeningBalanceModal from "./coff/SetOpeningBalanceModal";

export default function COffLedgerModal({
    isOpen = false,
    onClose,
    isAdmin = false,
    currentUser = null,
}) {
    const [ledgerData, setLedgerData] = useState([]);
    const [masterEmployees, setMasterEmployees] = useState([]);
    const [selectedEmpHistory, setSelectedEmpHistory] = useState(null);
    const [adjustingEmp, setAdjustingEmp] = useState(null);

    // Mouse Drag to Move Window State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const loadLedger = async () => {
        const liveEmployees = await fetchAllUsers();
        setMasterEmployees(liveEmployees);

        const data = await getAllEmployeesCOffSummary();

        const merged = liveEmployees.map((masterEmp) => {
            const found = data.find((d) => d.empId === masterEmp.empId);
            if (found) {
                return {
                    empId: masterEmp.empId,
                    name: masterEmp.name,
                    email: masterEmp.email || "",
                    earned: found.earned || 0,
                    availed: found.availed || 0,
                    balance: (found.earned || 0) - (found.availed || 0),
                    history: found.history || [],
                };
            }
            return {
                empId: masterEmp.empId,
                name: masterEmp.name,
                email: masterEmp.email || "",
                earned: 0,
                availed: 0,
                balance: 0,
                history: [],
            };
        });

        setLedgerData(merged);
    };

    useEffect(() => {
        if (isOpen) {
            loadLedger();
            setSelectedEmpHistory(null);
            setAdjustingEmp(null);
            setPosition({ x: 0, y: 0 });
        }
    }, [isOpen]);

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        };

        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        if (isOpen) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }

        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isOpen, position]);

    if (!isOpen) return null;

    // PRIVACY LAYER: Admin sees all employees. Regular employees only see their OWN C-OFF balance!
    const displayedLedger = isAdmin
        ? ledgerData
        : ledgerData.filter(
            (row) =>
                row.empId === currentUser?.empId ||
                row.email?.toLowerCase() === currentUser?.email?.toLowerCase() ||
                row.name?.toLowerCase() === currentUser?.name?.toLowerCase()
        );

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 select-none font-mono text-xs">
            {/* Draggable Window Container */}
            <div
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
                className="w-full max-w-4xl border-2 border-panel-border bg-panel-bg shadow-2xl max-h-[92vh] flex flex-col"
            >
                {/* Draggable Title Bar */}
                <div
                    onMouseDown={handleMouseDown}
                    className="flex items-center justify-between bg-header-bg px-3 py-1.5 text-header-text cursor-grab active:cursor-grabbing border-b border-black"
                    title="Click and drag to move window"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">⠿</span>
                        <span className="font-bold uppercase tracking-wider">
                            {isAdmin ? "Compensatory Off (C-OFF) Department Ledger" : "My Compensatory Off (C-OFF) Record"}
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-5 w-5 items-center justify-center border border-panel-border bg-panel-bg text-xs font-bold text-app-text active:translate-y-px cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Action Bar */}
                <div className="border-b border-panel-border p-2 bg-app-bg/30 flex items-center justify-between">
                    <span className="font-semibold text-retro-text">
                        {isAdmin
                            ? "Department 48-Hour Compliance Ledger (All Employees)"
                            : `Private Ledger for: ${currentUser?.name || currentUser?.email}`}
                    </span>
                    {isAdmin && (
                        <span className="text-[10px] text-gray-600 font-bold">
                            💡 Click [Set Balance] to adjust previous unavailed C-OFFs
                        </span>
                    )}
                </div>

                {/* Main Content Area */}
                <div className="p-3 overflow-y-auto space-y-4 flex-1">
                    <div className="border border-table-border overflow-x-auto shadow-inner">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-header-bg text-header-text uppercase text-[11px]">
                                    <th className="border border-table-border p-1.5 text-center w-16">Emp ID</th>
                                    <th className="border border-table-border p-1.5 text-center min-w-[150px]">Employee Name</th>
                                    <th className="border border-table-border p-1.5 text-center w-20 bg-[#1E3A2E]">
                                        Earned
                                    </th>
                                    <th className="border border-table-border p-1.5 text-center w-20 bg-[#8B2626]">
                                        Availed
                                    </th>
                                    <th className="border border-table-border p-1.5 text-center w-20 bg-[#3E5A3F]">
                                        Balance
                                    </th>
                                    <th className="border border-table-border p-1.5 text-center min-w-[140px]">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedLedger.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="retro-cell text-center py-6 text-gray-500 italic">
                                            No matching C-OFF records found for your employee profile.
                                        </td>
                                    </tr>
                                ) : (
                                    displayedLedger.map((row, idx) => (
                                        <tr
                                            key={row.empId}
                                            className={idx % 2 === 0 ? "bg-table-row-even" : "bg-table-row-odd"}
                                        >
                                            <td className="retro-cell text-center font-bold">{row.empId}</td>
                                            <td className="retro-cell text-center font-semibold">{row.name}</td>
                                            <td className="retro-cell text-center font-bold text-[#1E3A2E]">
                                                {row.earned}
                                            </td>
                                            <td className="retro-cell text-center font-bold text-[#7F1D1D]">
                                                {row.availed}
                                            </td>
                                            <td
                                                className={`retro-cell text-center font-black ${row.balance >= 0 ? "bg-[#D4EDDA] text-[#155724]" : "bg-[#F8D7DA] text-[#721C24]"
                                                    }`}
                                            >
                                                {row.balance}
                                            </td>
                                            <td className="retro-cell text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    {/* ⚙️ Set Opening Balance Button (Admin only) */}
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => setAdjustingEmp(row)}
                                                            className="retro-button bg-[#1E3A2E] text-white px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                                                            title="Set Opening / Unused C-OFF days"
                                                        >
                                                            ⚙️ Set Balance
                                                        </button>
                                                    )}

                                                    <button
                                                        onClick={() => setSelectedEmpHistory(row)}
                                                        className="retro-button bg-panel-bg px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                                                    >
                                                        History
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>

                    {/* Date-wise Detailed History View */}
                    {selectedEmpHistory && (
                        <div className="border-2 border-panel-border bg-white p-3 shadow-inner">
                            <div className="flex items-center justify-between border-b border-panel-border pb-1 mb-2">
                                <h4 className="font-bold uppercase text-header-bg">
                                    C-OFF Log: {selectedEmpHistory.empId} - {selectedEmpHistory.name}
                                </h4>
                                <button
                                    onClick={() => setSelectedEmpHistory(null)}
                                    className="text-red-700 font-bold hover:underline cursor-pointer"
                                >
                                    Close History
                                </button>
                            </div>

                            {selectedEmpHistory.history && selectedEmpHistory.history.length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse text-[11px]">
                                        <thead>
                                            <tr className="bg-black/10 text-retro-text uppercase">
                                                <th className="border border-table-border p-1 text-center w-24">Type</th>
                                                <th className="border border-table-border p-1 text-center w-24">Date</th>
                                                <th className="border border-table-border p-1 text-center w-16">Day</th>
                                                <th className="border border-table-border p-1 text-left">Remarks</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedEmpHistory.history.map((log, index) => (
                                                <tr key={index} className="border-b border-black/10">
                                                    <td className="p-1 text-center font-bold">
                                                        <span
                                                            className={`px-1.5 py-0.5 text-[9px] ${log.type === "OPENING_BALANCE"
                                                                    ? "bg-[#D1ECF1] text-[#0C5460]"
                                                                    : log.type === "EARNED"
                                                                        ? "bg-[#D4EDDA] text-[#155724]"
                                                                        : "bg-[#F8D7DA] text-[#721C24]"
                                                                }`}
                                                        >
                                                            {log.type}
                                                        </span>
                                                    </td>
                                                    <td className="p-1 text-center font-semibold">{log.date}</td>
                                                    <td className="p-1 text-center">{log.day || "-"}</td>
                                                    <td className="p-1 text-left text-gray-700">{log.notes || "-"}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <p className="text-gray-500 italic py-2 text-center">
                                    No C-OFF activity recorded yet for this employee.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end border-t border-panel-border bg-app-bg/40 px-3 py-2">
                    <button
                        onClick={onClose}
                        className="retro-button bg-panel-bg px-4 py-1 font-semibold text-app-text cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            {/* Dedicated Opening Balance Modal */}
            <SetOpeningBalanceModal
                isOpen={Boolean(adjustingEmp)}
                employee={adjustingEmp}
                onClose={() => setAdjustingEmp(null)}
                onSaved={loadLedger}
            />
        </div>
    );
}