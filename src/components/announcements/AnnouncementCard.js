"use client";

import React from "react";
import ImageGalleryLayout from "./ImageGalleryLayout";
import { formatToDDMMYYYY } from "../../utils/dateUtils";

export default function AnnouncementCard({
    announcement,
    isAdmin = false,
    onDelete,
    onPublishDraft,
}) {
    if (!announcement) return null;

    const createdAtDate = announcement.createdAt?.toDate
        ? announcement.createdAt.toDate()
        : new Date(announcement.createdAt || Date.now());

    const formattedDate = formatToDDMMYYYY(createdAtDate);
    const isDraft = announcement.status === "draft";

    return (
        <article className="border-2 border-[#3D4337] bg-white p-3 font-mono shadow-sm flex flex-col justify-between">
            <div>
                {/* Card Header */}
                <div className="flex flex-wrap items-start justify-between border-b border-black/15 pb-2 mb-2 gap-1">
                    <div>
                        <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black uppercase text-[#0F1F17]">
                                {announcement.title}
                            </h4>
                            {isDraft && (
                                <span className="bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] px-1.5 py-0.2 text-[9px] font-black uppercase">
                                    Draft
                                </span>
                            )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-0.5">
                            By: <strong>{announcement.authorName || "Department"}</strong> | Date: {formattedDate}
                        </p>
                    </div>
                </div>

                {/* Description Body */}
                <p className="text-xs text-[#3D4337] whitespace-pre-wrap leading-relaxed">
                    {announcement.description}
                </p>

                {/* Unique 1-4 Photo Album Grid */}
                {announcement.imageUrls && announcement.imageUrls.length > 0 && (
                    <ImageGalleryLayout images={announcement.imageUrls} />
                )}
            </div>

            {/* Card Footer for Admin Controls */}
            {isAdmin && (
                <div className="flex items-center justify-end gap-2 border-t border-black/15 pt-2 mt-3 text-xs">
                    {isDraft && onPublishDraft && (
                        <button
                            onClick={() => onPublishDraft(announcement.id)}
                            className="retro-button bg-[#1E3A2E] text-white px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                        >
                            🚀 Publish Live
                        </button>
                    )}

                    {onDelete && (
                        <button
                            onClick={() => onDelete(announcement)}
                            className="retro-button bg-[#8B2626] text-white px-2 py-0.5 text-[10px] font-bold cursor-pointer"
                        >
                            ✕ Delete
                        </button>
                    )}
                </div>
            )}
        </article>
    );
}