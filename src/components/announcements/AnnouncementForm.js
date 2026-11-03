"use client";

import React, { useState } from "react";
import { saveAnnouncement } from "../../utils/announcementService";

const MAX_TITLE = 120;
const MAX_DESC = 5000;
const MAX_PHOTOS = 4;
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

export default function AnnouncementForm({ onSuccess, onCancel, authorName = "Admin" }) {
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [photos, setPhotos] = useState([]);
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Handle image selection with 4-photo limit and 5MB validation
    const handlePhotoSelect = (e) => {
        setErrorMsg("");
        const selectedFiles = Array.from(e.target.files || []);

        if (photos.length + selectedFiles.length > MAX_PHOTOS) {
            setErrorMsg(`Maximum ${MAX_PHOTOS} photos allowed. Please select fewer images.`);
            return;
        }

        for (const file of selectedFiles) {
            if (file.size > MAX_FILE_SIZE) {
                setErrorMsg(`Photo "${file.name}" exceeds 5 MB limit. Please choose a smaller file.`);
                return;
            }
        }

        setPhotos((prev) => [...prev, ...selectedFiles].slice(0, MAX_PHOTOS));
    };

    const removePhoto = (index) => {
        setPhotos((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (isDraft = false) => {
        setErrorMsg("");

        if (!title.trim()) {
            setErrorMsg("Notice title is required.");
            return;
        }
        if (!description.trim()) {
            setErrorMsg("Notice description is required.");
            return;
        }

        setLoading(true);
        const res = await saveAnnouncement({
            title,
            description,
            images: photos,
            authorName,
            isDraft,
        });
        setLoading(false);

        if (res.success) {
            if (onSuccess) onSuccess(isDraft);
        } else {
            setErrorMsg(res.error || "Failed to save announcement.");
        }
    };

    return (
        <form noValidate className="border border-[#3D4337] bg-[#F5F7F0] p-3 text-xs font-mono space-y-3">
            {errorMsg && (
                <div className="border border-[#721C24] bg-[#F8D7DA] text-[#721C24] p-2 font-bold">
                    ⚠️ {errorMsg}
                </div>
            )}

            {/* Title Field with Character Counter */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[#0F1F17]">Notice Title *</label>
                    <span className={`text-[10px] font-bold ${title.length >= MAX_TITLE ? "text-red-700" : "text-gray-500"}`}>
                        {title.length}/{MAX_TITLE}
                    </span>
                </div>
                <input
                    type="text"
                    maxLength={MAX_TITLE}
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter announcement headline..."
                    className="w-full border border-[#3D4337] p-1.5 bg-white font-bold text-xs outline-none"
                />
            </div>

            {/* Description Field (Up to 5000 characters) */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[#0F1F17]">Description / Instructions (Up to 5000 chars) *</label>
                    <span className={`text-[10px] font-bold ${description.length >= MAX_DESC ? "text-red-700" : "text-gray-500"}`}>
                        {description.length}/{MAX_DESC}
                    </span>
                </div>
                <textarea
                    rows={5}
                    maxLength={MAX_DESC}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Write detailed departmental notice or instructions..."
                    className="w-full border border-[#3D4337] p-1.5 bg-white text-xs outline-none"
                />
            </div>

            {/* Photo Picker (Disabled when 4 photos selected) */}
            <div>
                <div className="flex justify-between items-center mb-1">
                    <label className="font-bold text-[#0F1F17]">
                        Attach Photos (Max 4 photos, 5 MB each)
                    </label>
                    <span className="text-[10px] font-bold text-gray-600">
                        Selected: {photos.length}/{MAX_PHOTOS}
                    </span>
                </div>

                <input
                    type="file"
                    accept="image/*"
                    multiple
                    disabled={photos.length >= MAX_PHOTOS}
                    onChange={handlePhotoSelect}
                    className="w-full border border-[#3D4337] p-1 bg-white text-xs cursor-pointer disabled:bg-gray-200 disabled:cursor-not-allowed"
                />

                {/* Selected Photos Thumbnail Bar */}
                {photos.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-2 p-1.5 bg-white border border-[#3D4337]">
                        {photos.map((file, idx) => (
                            <div key={idx} className="relative border border-black/40 p-0.5 bg-gray-50 flex items-center gap-1">
                                <span className="text-[10px] max-w-[120px] truncate font-bold text-[#0F1F17]">
                                    📷 {file.name}
                                </span>
                                <button
                                    type="button"
                                    onClick={() => removePhoto(idx)}
                                    className="bg-[#8B2626] text-white px-1 text-[9px] font-black cursor-pointer hover:bg-red-800"
                                >
                                    ✕
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Action Buttons: Draft vs Publish */}
            <div className="flex flex-wrap justify-end gap-2 pt-2 border-t border-[#3D4337]">
                {onCancel && (
                    <button
                        type="button"
                        onClick={onCancel}
                        className="retro-button bg-[#C7CBB8] text-[#0F1F17] px-3 py-1 font-bold cursor-pointer"
                    >
                        Cancel
                    </button>
                )}

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmit(true)} // Save as Draft
                    className="retro-button bg-[#C7CBB8] text-[#0F1F17] border-2 border-[#3D4337] px-3 py-1 font-black cursor-pointer hover:bg-black/10"
                >
                    {loading ? "Saving..." : "💾 Save as Draft"}
                </button>

                <button
                    type="button"
                    disabled={loading}
                    onClick={() => handleSubmit(false)} // Publish Live
                    className="retro-button bg-[#1E3A2E] text-white px-4 py-1 font-black cursor-pointer active:translate-y-px"
                >
                    {loading ? "Publishing..." : "🚀 Publish Now"}
                </button>
            </div>
        </form>
    );
}