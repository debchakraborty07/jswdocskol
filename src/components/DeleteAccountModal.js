"use client";

import React, { useState } from "react";
import { deleteCurrentAccountWithPassword } from "../utils/authService";

export default function DeleteAccountModal({ isOpen, onClose, onSuccess }) {
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (!password) {
            setError("Password is required.");
            return;
        }

        setLoading(true);
        const res = await deleteCurrentAccountWithPassword(password);
        setLoading(false);

        if (res.success) {
            onSuccess();
        } else {
            setError(res.error || "Failed to delete account.");
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 font-mono select-none">
            <div className="w-full max-w-sm border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
                <div className="flex items-center justify-between bg-[#8B2626] px-3 py-1.5 text-white font-black text-xs uppercase">
                    <span>Confirm Account Deletion</span>
                    <button onClick={onClose} className="cursor-pointer hover:underline">✕</button>
                </div>

                <form onSubmit={handleSubmit} className="p-4 space-y-3">
                    <p className="text-xs font-bold text-[#721C24]">
                        Warning: This action will permanently remove your credentials.
                    </p>

                    {error && (
                        <div className="bg-[#F8D7DA] text-[#721C24] p-2 text-xs font-bold border border-[#721C24]">
                            ⚠️ {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-black text-[#0F1F17] mb-1">
                            Enter Current Password:
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            className="w-full border border-[#3D4337] p-1.5 bg-white text-xs outline-none"
                        />
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-[#3D4337]">
                        <button
                            type="button"
                            onClick={onClose}
                            className="retro-button bg-[#C7CBB8] text-[#0F1F17] px-3 py-1 text-xs font-bold cursor-pointer"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="retro-button bg-[#8B2626] text-white px-3 py-1 text-xs font-black cursor-pointer"
                        >
                            {loading ? "Verifying..." : "Delete Permanently"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}