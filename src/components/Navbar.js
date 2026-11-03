"use client";

import React, { useState, useEffect, useRef } from "react";
import CustomModal from "./CustomModal";

export default function Navbar({
    user = null,
    activeView = "home",
    onSelectView,
    onOpenUserManager,
    onOpenCOffLedger,
    onOpenNoticePost,
    onChangePassword,
    onSignOut,
    onDeleteAccount,
}) {
    const [openMenu, setOpenMenu] = useState(null);
    const [showSignOutModal, setShowSignOutModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    const menuRef = useRef(null);

    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setOpenMenu(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const toggleMenu = (menuName) => {
        setOpenMenu(openMenu === menuName ? null : menuName);
    };

    const isAdmin = user?.role === "admin";

    return (
        <header className="w-full border-b-2 border-panel-border bg-[#0F1F17] font-mono select-none" ref={menuRef}>
            {/* 1. Top Branding Header Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-3 py-1.5 border-b border-white/20 gap-2">
                <div className="flex items-center gap-2">
                    <span className="bg-[#1E3A2E] text-white border border-white/40 px-2 py-0.5 text-xs font-black tracking-widest uppercase">
                        JSW
                    </span>
                    <div>
                        <h1 className="text-xs sm:text-sm font-black uppercase tracking-wide text-white">
                            Documentation Department Portal
                        </h1>
                        <p className="text-[10px] text-gray-300">
                            Operational Roster & Attendance Control System
                        </p>
                    </div>
                </div>

                {/* User Status Tag */}
                {user && (
                    <div className="flex items-center gap-2 text-xs">
                        <span className="text-[11px] text-gray-300">
                            User: <strong className="text-white">{user.name || user.email}</strong>
                        </span>
                        <span
                            className={`px-1.5 py-0.2 text-[9px] font-black uppercase ${isAdmin ? "bg-[#D4EDDA] text-[#155724]" : "bg-[#FFF3CD] text-[#856404]"
                                }`}
                        >
                            {user.role || "viewer"}
                        </span>
                    </div>
                )}
            </div>

            {/* 2. Menu Bar */}
            {user && (
                <div className="flex flex-wrap items-center bg-[#C7CBB8] text-[#0F1F17] px-2 py-1 text-xs border-b border-[#3D4337] gap-1 relative z-30 font-bold">
                    {/* Menu 1: Operations */}
                    <div className="relative">
                        <button
                            onClick={() => toggleMenu("operations")}
                            className={`px-3 py-1 border border-transparent font-black cursor-pointer active:translate-y-px ${openMenu === "operations"
                                ? "bg-[#1E3A2E] text-white border-black"
                                : "text-[#0F1F17] hover:bg-black/15"
                                }`}
                        >
                            Operations ▾
                        </button>

                        {openMenu === "operations" && (
                            <div className="absolute left-0 top-full mt-0.5 w-56 border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl z-50 text-xs">
                                <button
                                    onClick={() => {
                                        if (onSelectView) onSelectView("home");
                                        setOpenMenu(null);
                                    }}
                                    className={`w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer ${activeView === "home" ? "bg-black/10" : ""
                                        }`}
                                >
                                    View Live Roster (Home)
                                </button>

                                {isAdmin && (
                                    <button
                                        onClick={() => {
                                            if (onSelectView) onSelectView("builder");
                                            setOpenMenu(null);
                                        }}
                                        className={`w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer border-t border-[#3D4337]/30 ${activeView === "builder" ? "bg-black/10" : ""
                                            }`}
                                    >
                                        Roster Builder / Editor
                                    </button>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Menu 2: Admin Tools (Admin Only) */}
                    {isAdmin && (
                        <div className="relative">
                            <button
                                onClick={() => toggleMenu("admin")}
                                className={`px-3 py-1 border border-transparent font-black cursor-pointer active:translate-y-px ${openMenu === "admin"
                                    ? "bg-[#1E3A2E] text-white border-black"
                                    : "text-[#0F1F17] hover:bg-black/15"
                                    }`}
                            >
                                Admin Tools ▾
                            </button>

                            {openMenu === "admin" && (
                                <div className="absolute left-0 top-full mt-0.5 w-60 border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl z-50 text-xs">
                                    <button
                                        onClick={() => {
                                            if (onOpenUserManager) onOpenUserManager();
                                            setOpenMenu(null);
                                        }}
                                        className="w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer"
                                    >
                                        Manage Users & Roles
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (onOpenCOffLedger) onOpenCOffLedger();
                                            setOpenMenu(null);
                                        }}
                                        className="w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer border-t border-[#3D4337]/30"
                                    >
                                        C-OFF Ledger & Balance
                                    </button>

                                    <button
                                        onClick={() => {
                                            if (onOpenNoticePost) onOpenNoticePost();
                                            setOpenMenu(null);
                                        }}
                                        className="w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer border-t border-[#3D4337]/30"
                                    >
                                        Post Announcement / Photo
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

                    {/* C-OFF View for Non-Admin */}
                    {!isAdmin && (
                        <button
                            onClick={onOpenCOffLedger}
                            className="px-3 py-1 font-black text-[#0F1F17] hover:bg-black/15 cursor-pointer"
                        >
                            My C-OFF Balance
                        </button>
                    )}

                    {/* Menu 3: Account (Right Aligned) */}
                    <div className="relative ml-auto">
                        <button
                            onClick={() => toggleMenu("account")}
                            className={`px-3 py-1 border border-transparent font-black cursor-pointer active:translate-y-px ${openMenu === "account"
                                ? "bg-[#1E3A2E] text-white border-black"
                                : "text-[#0F1F17] hover:bg-black/15"
                                }`}
                        >
                            Account ▾
                        </button>

                        {openMenu === "account" && (
                            <div className="absolute right-0 top-full mt-0.5 w-56 border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl z-50 text-xs">
                                <div className="px-3 py-2 border-b border-[#3D4337]/30 bg-black/5 text-[11px] text-[#0F1F17]">
                                    Signed in: <strong className="block truncate">{user.email}</strong>
                                </div>

                                {/* 🔑 Change Password Option */}
                                <button
                                    onClick={() => {
                                        if (onChangePassword) onChangePassword();
                                        setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer"
                                >
                                    Change Password
                                </button>

                                <button
                                    onClick={() => {
                                        setShowSignOutModal(true);
                                        setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 font-black text-[#0F1F17] hover:bg-[#1E3A2E] hover:text-white cursor-pointer border-t border-[#3D4337]/30"
                                >
                                    Sign Out
                                </button>

                                <button
                                    onClick={() => {
                                        setShowDeleteModal(true);
                                        setOpenMenu(null);
                                    }}
                                    className="w-full text-left px-3 py-2 font-black text-[#8B2626] hover:bg-[#8B2626] hover:text-white cursor-pointer border-t border-[#3D4337]/30"
                                >
                                    Delete Account
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Confirmation Modals */}
            <CustomModal
                isOpen={showSignOutModal}
                title="Confirm Sign Out"
                message="Are you sure you want to end your session?"
                confirmText="Sign Out"
                onConfirm={() => {
                    setShowSignOutModal(false);
                    if (onSignOut) onSignOut();
                }}
                onCancel={() => setShowSignOutModal(false)}
            />

            <CustomModal
                isOpen={showDeleteModal}
                title="Permanent Account Deletion"
                message="Warning: This will permanently remove your account record from the system. Continue?"
                isDanger={true}
                confirmText="Delete Account"
                onConfirm={() => {
                    setShowDeleteModal(false);
                    if (onDeleteAccount) onDeleteAccount();
                }}
                onCancel={() => setShowDeleteModal(false)}
            />
        </header>
    );
}