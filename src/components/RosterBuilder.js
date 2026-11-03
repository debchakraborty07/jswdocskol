"use client";

import React from "react";
import RosterTable from "./RosterTable";
import WorkingSchedule from "./WorkingSchedule";

export default function RosterBuilder({ onPublishRoster, savedWeeksList }) {
    return (
        <div className="space-y-4 font-mono select-none">
            <div className="bg-[#FFF3CD] border border-[#856404] text-[#856404] p-2.5 text-xs font-bold shadow-sm">
                🛠️ <strong>Admin Deployment Studio:</strong> Assign shifts below. When completed, click <strong>Save & Publish</strong> to push updates to the live employee dashboard.
            </div>

            {/* Editable Roster with Admin Permissions */}
            <RosterTable
                isAdmin={true}
                onSaveRosterToCloud={onPublishRoster}
                savedWeeksList={savedWeeksList}
            />

            {/* 100% Full-Width Working Schedule (Matches Roster Width) */}
            <WorkingSchedule className="w-full" />
        </div>
    );
}