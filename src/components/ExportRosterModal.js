"use client";

import React, { useState } from "react";
import { exportWeekToExcel } from "../utils/excelExport";

export default function ExportRosterModal({
    isOpen = false,
    onClose,
    currentWeekDate,
    weekDays,
    rosterRecords,
}) {
    const [downloading, setDownloading] = useState(false);

    if (!isOpen) return null;

    const handleDownloadCurrentWeek = () => {
        setDownloading(true);
        exportWeekToExcel(currentWeekDate, weekDays, rosterRecords);
        setDownloading(false);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono select-none text-xs">
            <div className="w-full max-w-sm border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
                <div className="flex items-center justify-between bg-[#0F1F17] px-3 py-1.5 text-white font-black">
                    <span>📥 Download Roster to Excel</span>
                    <button onClick={onClose} className="hover:underline cursor-pointer">✕</button>
                </div>

                <div className="p-4 space-y-3">
                    <p className="font-bold text-[#0F1F17]">
                        Select export format for official documentation records:
                    </p>

                    <div className="border border-[#3D4337] bg-white p-3 space-y-2">
                        <button
                            onClick={handleDownloadCurrentWeek}
                            disabled={downloading || !rosterRecords || rosterRecords.length === 0}
                            className="retro-button w-full bg-[#1E3A2E] text-white py-2 font-bold cursor-pointer disabled:bg-gray-400"
                        >
                            📊 Download Active Week ({currentWeekDate})
                        </button>
                        <p className="text-[10px] text-gray-500 text-center">
                            Generates formatted .xlsx file matching your company deployment layout.
                        </p>
                    </div>
                </div>

                <div className="flex justify-end border-t border-[#3D4337] bg-[#C7CBB8] px-3 py-2">
                    <button
                        onClick={onClose}
                        className="retro-button bg-[#D6DACB] text-[#0F1F17] px-4 py-1 font-bold cursor-pointer"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
}