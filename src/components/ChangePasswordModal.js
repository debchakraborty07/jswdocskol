"use client";

import React, { useState } from "react";
import { changeCurrentUserPassword } from "../utils/authService";

export default function ChangePasswordModal({ isOpen = false, onClose }) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [feedback, setFeedback] = useState(null);
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        if (!currentPassword) {
            setFeedback({ type: "error", text: "Please enter your current password." });
            return;
        }

        if (!newPassword || newPassword.length < 6) {
            setFeedback({ type: "error", text: "New password must be at least 6 characters." });
            return;
        }

        if (newPassword !== confirmPassword) {
            setFeedback({ type: "error", text: "New passwords do not match." });
            return;
        }

        setLoading(true);
        const res = await changeCurrentUserPassword(currentPassword, newPassword);
        setLoading(false);

        if (res.success) {
            setFeedback({ type: "success", text: "Password updated successfully!" });
            setTimeout(() => {
                onClose();
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setFeedback(null);
            }, 1200);
        } else {
            setFeedback({ type: "error", text: res.error || "Password change failed." });
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono select-none text-xs">
            <div className="w-full max-w-sm border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
                <div className="flex items-center justify-between bg-[#1E3A2E] px-3 py-1.5 text-white font-bold">
                    <span>🔑 Change Security Password</span>
                    <button onClick={onClose} className="hover:underline cursor-pointer">✕</button>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-4 space-y-3">
                    {feedback && (
                        <div
                            className={`p-2 font-bold border ${feedback.type === "success"
                                    ? "bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]"
                                    : "bg-[#F8D7DA] text-[#721C24] border-[#F5C6CB]"
                                }`}
                        >
                            {feedback.type === "success" ? "✓" : "⚠️"} {feedback.text}
                        </div>
                    )}

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">Current Password *</label>
                        <input
                            type="password"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-[#3D4337] p-1.5 bg-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">New Password (Min 6 chars) *</label>
                        <input
                            type="password"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-[#3D4337] p-1.5 bg-white outline-none"
                        />
                    </div>

                    <div>
                        <label className="block font-bold text-[#0F1F17] mb-1">Confirm New Password *</label>
                        <input
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-[#3D4337] p-1.5 bg-white outline-none"
                        />
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
                            {loading ? "Updating..." : "Update Password"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}