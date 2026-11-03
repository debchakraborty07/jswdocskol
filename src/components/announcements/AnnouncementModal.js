"use client";

import React, { useState, useEffect } from "react";
import {
    fetchPublishedAnnouncements,
    fetchDraftAnnouncements,
    publishDraft,
    deleteAnnouncementRecord,
} from "../../utils/announcementService";
import AnnouncementForm from "./AnnouncementForm";
import AnnouncementCard from "./AnnouncementCard";
import CustomModal from "../CustomModal";

export default function AnnouncementModal({
    isOpen = false,
    onClose,
    authorName = "Admin",
    onAnnouncementsUpdated,
}) {
    const [activeTab, setActiveTab] = useState("form"); // 'form' | 'published' | 'drafts'
    const [published, setPublished] = useState([]);
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const loadAll = async () => {
        setLoading(true);
        const [pubData, draftData] = await Promise.all([
            fetchPublishedAnnouncements(),
            fetchDraftAnnouncements(),
        ]);
        setPublished(pubData);
        setDrafts(draftData);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            loadAll();
            setActiveTab("form");
        }
    }, [isOpen]);

    const handleFormSuccess = async (isDraft) => {
        await loadAll();
        setActiveTab(isDraft ? "drafts" : "published");
        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
    };

    const handlePublishExistingDraft = async (id) => {
        await publishDraft(id);
        await loadAll();
        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;
        await deleteAnnouncementRecord(deleteTarget.id, deleteTarget.imageUrls);
        setDeleteTarget(null);
        await loadAll();
        if (onAnnouncementsUpdated) onAnnouncementsUpdated();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 select-none font-mono text-xs">
            <div className="w-full max-w-4xl border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl max-h-[92vh] flex flex-col">
                {/* Title Bar */}
                <div className="flex items-center justify-between bg-[#0F1F17] px-3 py-1.5 text-white">
                    <span className="font-bold uppercase tracking-wider">
                        Announcement & Photo Broadcast Center
                    </span>
                    <button onClick={onClose} className="font-bold cursor-pointer hover:underline">
                        ✕
                    </button>
                </div>

                {/* Tab Controls */}
                <div className="flex items-center border-b border-[#3D4337] bg-[#C7CBB8] px-2 pt-2 gap-1 font-bold">
                    <button
                        onClick={() => setActiveTab("form")}
                        className={`px-3 py-1.5 border-t border-x border-[#3D4337] cursor-pointer ${activeTab === "form" ? "bg-[#F5F7F0] text-black" : "bg-[#C7CBB8] text-gray-700 hover:bg-black/5"
                            }`}
                    >
                        ✏️ Create New
                    </button>

                    <button
                        onClick={() => setActiveTab("published")}
                        className={`px-3 py-1.5 border-t border-x border-[#3D4337] cursor-pointer ${activeTab === "published" ? "bg-[#F5F7F0] text-black" : "bg-[#C7CBB8] text-gray-700 hover:bg-black/5"
                            }`}
                    >
                        📢 Live Published ({published.length})
                    </button>

                    <button
                        onClick={() => setActiveTab("drafts")}
                        className={`px-3 py-1.5 border-t border-x border-[#3D4337] cursor-pointer ${activeTab === "drafts" ? "bg-[#F5F7F0] text-black" : "bg-[#C7CBB8] text-gray-700 hover:bg-black/5"
                            }`}
                    >
                        💾 Saved Drafts ({drafts.length})
                    </button>
                </div>

                {/* Tab Body */}
                <div className="p-3 overflow-y-auto flex-1 bg-[#F5F7F0]">
                    {activeTab === "form" && (
                        <AnnouncementForm
                            authorName={authorName}
                            onSuccess={handleFormSuccess}
                            onCancel={onClose}
                        />
                    )}

                    {activeTab === "published" && (
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-center py-6 text-gray-500 font-bold">Loading notices...</p>
                            ) : published.length === 0 ? (
                                <p className="text-center py-6 text-gray-500 italic">No published notices found.</p>
                            ) : (
                                published.map((item) => (
                                    <AnnouncementCard
                                        key={item.id}
                                        announcement={item}
                                        isAdmin={true}
                                        onDelete={(target) => setDeleteTarget(target)}
                                    />
                                ))
                            )}
                        </div>
                    )}

                    {activeTab === "drafts" && (
                        <div className="space-y-3">
                            {loading ? (
                                <p className="text-center py-6 text-gray-500 font-bold">Loading drafts...</p>
                            ) : drafts.length === 0 ? (
                                <p className="text-center py-6 text-gray-500 italic">No saved drafts found.</p>
                            ) : (
                                drafts.map((item) => (
                                    <AnnouncementCard
                                        key={item.id}
                                        announcement={item}
                                        isAdmin={true}
                                        onPublishDraft={handlePublishExistingDraft}
                                        onDelete={(target) => setDeleteTarget(target)}
                                    />
                                ))
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-[#3D4337] bg-[#C7CBB8] px-3 py-2">
                    <button
                        onClick={onClose}
                        className="retro-button bg-[#D6DACB] text-[#0F1F17] px-4 py-1 font-bold cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            <CustomModal
                isOpen={Boolean(deleteTarget)}
                title="Delete Announcement"
                message={`Are you sure you want to permanently delete "${deleteTarget?.title}"?`}
                isDanger={true}
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}