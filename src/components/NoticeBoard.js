"use client";

import React, { useState, useEffect } from "react";
import { fetchPublishedAnnouncements } from "../utils/announcementService";
import AnnouncementCard from "./announcements/AnnouncementCard";
import DeletePostModal from "./announcements/DeletePostModal";

export default function NoticeBoard({ isAdmin = false, refreshTrigger = 0 }) {
    const [notices, setNotices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadPublishedNotices = async () => {
        setLoading(true);
        const data = await fetchPublishedAnnouncements();
        setNotices(data);
        setLoading(false);
    };

    useEffect(() => {
        loadPublishedNotices();
    }, [refreshTrigger]);

    return (
        <div className="w-full border-2 border-[#3D4337] bg-[#D6DACB] p-3 shadow-md font-mono select-none">
            {/* Title Bar */}
            <div className="border-b-2 border-[#3D4337] pb-2 mb-3">
                <h3 className="text-sm font-black uppercase tracking-wide text-[#0F1F17]">
                    Department Notice & Information Broadcast
                </h3>
                <p className="text-[11px] text-[#1E3A2E] font-bold">
                    Official departmental announcements, procedures, and attachments
                </p>
            </div>

            {/* Notices Stream */}
            {loading ? (
                <div className="p-6 text-center text-xs font-bold text-gray-600">
                    Syncing latest announcements...
                </div>
            ) : notices.length === 0 ? (
                <div className="border border-dashed border-[#3D4337] p-8 text-center text-xs text-gray-600 italic bg-white/40">
                    No official announcements published currently.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-start">
                    {notices.map((item) => (
                        <AnnouncementCard
                            key={item.id}
                            announcement={item}
                            isAdmin={isAdmin}
                            onDelete={(target) => setDeleteTarget(target)}
                        />
                    ))}
                </div>
            )}

            {/* Dedicated Delete Modal */}
            <DeletePostModal
                isOpen={Boolean(deleteTarget)}
                post={deleteTarget}
                onClose={() => setDeleteTarget(null)}
                onDeleted={() => loadPublishedNotices()}
            />
        </div>
    );
}