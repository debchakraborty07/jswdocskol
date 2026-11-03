"use client";

import React, { useState, useEffect, useRef } from "react";
import WorkingSchedule from "./WorkingSchedule";

export default function WorkingScheduleModal({ isOpen = false, onClose }) {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    useEffect(() => {
        if (isOpen) setPosition({ x: 0, y: 0 });
    }, [isOpen]);

    const handleMouseDown = (e) => {
        isDraggingRef.current = true;
        dragStartRef.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    useEffect(() => {
        const handleMouseMove = (e) => {
            if (!isDraggingRef.current) return;
            setPosition({
                x: e.clientX - dragStartRef.current.x,
                y: e.clientY - dragStartRef.current.y,
            });
        };
        const handleMouseUp = () => {
            isDraggingRef.current = false;
        };

        if (isOpen) {
            window.addEventListener("mousemove", handleMouseMove);
            window.addEventListener("mouseup", handleMouseUp);
        }
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", handleMouseUp);
        };
    }, [isOpen, position]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 font-mono select-none text-xs">
            {/* Wide 4XL Draggable Window */}
            <div
                style={{ transform: `translate(${position.x}px, ${position.y}px)` }}
                className="w-full max-w-4xl border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl max-h-[92vh] flex flex-col"
            >
                {/* Draggable Title Bar */}
                <div
                    onMouseDown={handleMouseDown}
                    className="flex items-center justify-between bg-[#0F1F17] px-3 py-1.5 text-white cursor-grab active:cursor-grabbing border-b border-black"
                    title="Drag to move window"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">⠿</span>
                        <span className="font-bold uppercase tracking-wider">
                            Working Schedule & Shift Guidelines Window
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-5 w-5 items-center justify-center border border-white/40 bg-[#1E3A2E] text-xs font-black text-white hover:bg-[#8B2626] cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Wide Schedule Component */}
                <div className="p-3 overflow-y-auto flex-1">
                    <WorkingSchedule className="w-full shadow-none" />
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
        </div>
    );
}