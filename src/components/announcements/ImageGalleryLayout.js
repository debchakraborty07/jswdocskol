"use client";

import React, { useState } from "react";

export default function ImageGalleryLayout({ images = [] }) {
    const [previewUrl, setPreviewUrl] = useState(null);

    if (!images || images.length === 0) return null;

    const count = Math.min(images.length, 4);

    // Dynamic 90s Album Grid configurations based on photo count
    const getGridClasses = () => {
        if (count === 1) return "grid-cols-1";
        if (count === 2) return "grid-cols-2";
        if (count === 3) return "grid-cols-2";
        return "grid-cols-2";
    };

    return (
        <div className="mt-3 select-none">
            {/* Photo Frame Container */}
            <div className={`grid ${getGridClasses()} gap-2`}>
                {images.slice(0, 4).map((url, idx) => {
                    // Special span for 3rd photo in 3-image layout
                    const isFeatured = count === 3 && idx === 0;

                    return (
                        <div
                            key={idx}
                            onClick={() => setPreviewUrl(url)}
                            className={`border-2 border-[#3D4337] bg-white p-1 cursor-pointer hover:border-black active:translate-y-px shadow-sm ${isFeatured ? "col-span-2 sm:col-span-1 sm:row-span-2" : ""
                                }`}
                        >
                            <div className="relative w-full h-40 sm:h-48 overflow-hidden bg-black/5 flex items-center justify-center">
                                <img
                                    src={url}
                                    alt={`Attachment ${idx + 1}`}
                                    className="w-full h-full object-cover"
                                    loading="lazy"
                                />
                                <span className="absolute bottom-1 right-1 bg-black/70 text-white text-[9px] font-mono px-1">
                                    🔍 Click to Zoom
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Enlarged Fullscreen Preview Window */}
            {previewUrl && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-2 sm:p-4 font-mono">
                    <div className="w-full max-w-4xl max-h-[92vh] border-2 border-[#3D4337] bg-[#D6DACB] p-2 flex flex-col shadow-2xl">
                        <div className="flex justify-between items-center border-b border-[#3D4337] pb-1 mb-2 bg-[#0F1F17] px-2 py-1 text-white">
                            <span className="text-xs font-bold uppercase tracking-wider">Photo View</span>
                            <button
                                onClick={() => setPreviewUrl(null)}
                                className="retro-button bg-[#8B2626] text-white px-2 py-0.5 text-xs font-bold cursor-pointer"
                            >
                                Close ✕
                            </button>
                        </div>
                        <div className="overflow-auto flex-1 flex items-center justify-center bg-white border border-[#3D4337]">
                            <img src={previewUrl} alt="Enlarged" className="max-h-[80vh] w-auto object-contain" />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}