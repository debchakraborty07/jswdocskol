"use client";

import React, { useState } from "react";
import { deleteAnnouncementRecord } from "../../utils/announcementService";

export default function DeletePostModal({
    isOpen = false,
    post = null,
    onClose,
    onDeleted,
}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen || !post) return null;

    const handleConfirmDelete = async () => {
        setLoading(true);
        setError("");

        // Deletes Firestore record + purges all attached images from Firebase Storage
        const res = await deleteAnnouncementRecord(post.id, post.imageUrls || []);
        setLoading(false);

        if (res.success) {
            if (onDeleted) onDeleted(post.id);
            onClose();
        } else {
            setError(res.error || "Failed to delete announcement.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono select-none text-xs">
            <div className="w-full max-w-sm border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
                {/* Title Bar */}
                <div className="flex items-center justify-between bg-[#8B2626] px-3 py-1.5 text-white font-black">
                    <span className="uppercase tracking-wider">Confirm Delete Notice</span>
                    <button onClick={onClose} className="hover:underline cursor-pointer">✕</button>
                </div>

                {/* Modal Body */}
                <div className="p-4 space-y-3">
                    <p className="font-bold text-[#721C24]">
                        Are you sure you want to permanently delete this announcement?
                    </p>

                    <div className="border border-black/20 bg-white p-2">
                        <p className="font-black text-[#0F1F17] truncate">{post.title}</p>
                        {post.imageUrls && post.imageUrls.length > 0 && (
                            <p className="text-[10px] text-gray-500 mt-1">
                                📷 {post.imageUrls.length} attached photo(s) will be erased from storage.
                            </p>
                        )}
                    </div>

                    {error && (
                        <div className="bg-[#F8D7DA] text-[#721C24] p-1.5 font-bold border border-[#721C24]">
                            ⚠️ {error}
                        </div>
                    )}
                </div>

                {/* Modal Footer */}
                <div className="flex justify-end gap-2 border-t border-[#3D4337] bg-[#C7CBB8] px-3 py-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="retro-button bg-[#D6DACB] text-[#0F1F17] px-3 py-1 font-bold cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={loading}
                        onClick={handleConfirmDelete}
                        className="retro-button bg-[#8B2626] text-white px-3 py-1 font-black cursor-pointer"
                    >
                        {loading ? "Deleting..." : "Delete Permanently"}
                    </button>
                </div>
            </div>
        </div>
    );
}