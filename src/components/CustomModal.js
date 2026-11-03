"use client";

import React from "react";

export default function CustomModal({
    isOpen,
    title = "System Notification",
    message = "Are you sure you want to proceed?",
    confirmText = "OK",
    cancelText = "Cancel",
    isDanger = false,
    onConfirm,
    onCancel,
}) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
            {/* 90s Style Modal Window */}
            <div
                className="w-full max-w-sm border-2 border-panel-border bg-panel-bg shadow-2xl"
                role="dialog"
                aria-modal="true"
            >
                {/* Title Bar */}
                <div className="flex items-center justify-between bg-header-bg px-3 py-1.5 text-header-text">
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {title}
                    </span>
                    <button
                        onClick={onCancel}
                        className="flex h-5 w-5 items-center justify-center border border-panel-border bg-panel-bg text-xs font-bold text-app-text active:translate-y-px"
                        aria-label="Close"
                    >
                        ✕
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-4">
                    <p className="text-sm font-medium text-app-text">
                        {message}
                    </p>
                </div>

                {/* Modal Footer Controls */}
                <div className="flex justify-end gap-2 border-t border-panel-border bg-app-bg/40 px-3 py-2">
                    {cancelText && (
                        <button
                            onClick={onCancel}
                            className="retro-button bg-panel-bg px-4 py-1 text-xs font-semibold text-app-text"
                        >
                            {cancelText}
                        </button>
                    )}

                    <button
                        onClick={onConfirm}
                        className={`retro-button px-4 py-1 text-xs font-semibold ${isDanger
                                ? "bg-btn-danger text-white"
                                : "bg-btn-bg text-btn-text"
                            }`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}