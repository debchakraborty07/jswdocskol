"use client";

import React, { useState, useEffect } from "react";
import { adjustEmployeeCOffLedger } from "../../utils/c-off";

export default function SetOpeningBalanceModal({
    isOpen = false,
    employee = null,
    onClose,
    onSaved,
}) {
    const [earned, setEarned] = useState(0);
    const [availed, setAvailed] = useState(0);
    const [remarks, setRemarks] = useState("Previous Unused C-OFF");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (employee) {
            setEarned(employee.earned || 0);
            setAvailed(employee.availed || 0);
            setRemarks("Previous Unused C-OFF");
        }
    }, [employee]);

    if (!isOpen || !employee) return null;

    const currentResultingBalance = Number(earned) - Number(availed);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const res = await adjustEmployeeCOffLedger(employee.empId, employee.name, {
            earned,
            availed,
            remarks,
        });

        setLoading(false);
        if (res.success) {
            if (onSaved) onSaved();
            onClose();
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 font-mono select-none text-xs">
            <div className="w-full max-w-sm border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
                {/* Title Bar */}
                <div className="flex items-center justify-between bg-[#1E3A2E] px-3 py-1.5 text-white font-bold">
                    <span>⚙️ Set Opening Balance - {employee.empId}</span>
                    <button onClick={onClose} className="hover:underline cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-4 space-y-3">
                    <div className="bg-white border border-[#3D4337] p-2">
                        <p className="font-bold text-[#0F1F17]">{employee.name}</p>
                        <p className="text-[10px] text-gray-500">Employee ID: {employee.empId}</p>
                    </div>

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">
                            Total Earned / Unused C-OFFs (Previous Days) *
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={earned}
                            onChange={(e) => setEarned(e.target.value)}
                            className="w-full border border-[#3D4337] p-1.5 bg-white font-black text-sm"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">
                            Already Availed (Keep 0 if fresh)
                        </label>
                        <input
                            type="number"
                            min="0"
                            max="50"
                            value={availed}
                            onChange={(e) => setAvailed(e.target.value)}
                            className="w-full border border-[#3D4337] p-1.5 bg-white font-bold"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">Remarks</label>
                        <input
                            type="text"
                            value={remarks}
                            onChange={(e) => setRemarks(e.target.value)}
                            className="w-full border border-[#3D4337] p-1.5 bg-white"
                        />
                    </div>

                    {/* Live Resulting Balance Preview */}
                    <div className="border border-[#1E3A2E] bg-[#D4EDDA] p-2 text-center">
                        <span className="text-[11px] font-bold text-[#155724]">
                            New Available Balance: <strong>{currentResultingBalance} Days</strong>
                        </span>
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#3D4337]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="retro-button bg-[#C7CBB8] text-[#0F1F17] px-3 py-1 font-bold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="retro-button bg-[#1E3A2E] text-white px-4 py-1 font-black cursor-pointer"
                        >
                            {loading ? "Saving..." : "Save Balance"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}