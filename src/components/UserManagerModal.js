"use client";

import React, { useState, useEffect, useRef } from "react";
import {
    fetchAllUsers,
    addNewAuthorizedUser,
    updateEmployeeDetails,
    removeUserAccess,
} from "../utils/userManagerService";
import CustomModal from "./CustomModal";

export default function UserManagerModal({
    isOpen = false,
    onClose,
    currentUserEmail = "",
    onEmployeeListChanged,
}) {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [feedback, setFeedback] = useState(null);
    const [deleteTarget, setDeleteTarget] = useState(null);

    // Mouse Drag to Move Window State
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const isDraggingRef = useRef(false);
    const dragStartRef = useRef({ x: 0, y: 0 });

    const [formData, setFormData] = useState({
        empId: "",
        name: "",
        designation: "",
        email: "",
        role: "viewer",
    });

    const loadUsers = async () => {
        setLoading(true);
        const data = await fetchAllUsers();
        setUsers(data);
        setLoading(false);
    };

    useEffect(() => {
        if (isOpen) {
            loadUsers();
            setFeedback(null);
            setIsFormOpen(false);
            setEditingUser(null);
            setPosition({ x: 0, y: 0 }); // Center reset
        }
    }, [isOpen]);

    // Window Drag Handlers
    const handleMouseDown = (e) => {
        // Only drag when clicking the title bar header
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

    const handleOpenAdd = () => {
        setEditingUser(null);
        setFormData({ empId: "", name: "", designation: "", email: "", role: "viewer" });
        setFeedback(null);
        setIsFormOpen(true);
    };

    const handleOpenEdit = (user) => {
        setEditingUser(user);
        setFormData({
            empId: user.empId,
            name: user.name,
            designation: user.designation || "",
            email: user.email,
            role: user.role || "viewer",
        });
        setFeedback(null);
        setIsFormOpen(true);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setFeedback(null);

        if (!formData.empId.trim()) {
            setFeedback({ type: "error", text: "Please enter an Employee ID." });
            return;
        }
        if (!formData.name.trim()) {
            setFeedback({ type: "error", text: "Please enter the Full Name." });
            return;
        }
        if (!formData.designation.trim()) {
            setFeedback({ type: "error", text: "Please enter the Designation." });
            return;
        }
        if (!formData.email.trim()) {
            setFeedback({ type: "error", text: "Please enter the Official Email." });
            return;
        }

        setLoading(true);

        if (editingUser) {
            const res = await updateEmployeeDetails(editingUser.id, formData);
            if (res.success) {
                setFeedback({ type: "success", text: `Updated ${formData.name} successfully.` });
                setIsFormOpen(false);
                setEditingUser(null);
                await loadUsers();
                if (onEmployeeListChanged) onEmployeeListChanged();
            } else {
                setFeedback({ type: "error", text: "Failed to update employee details." });
            }
        } else {
            const res = await addNewAuthorizedUser(formData);
            if (res.success) {
                setFeedback({ type: "success", text: `Added ${formData.name} to employee directory.` });
                setIsFormOpen(false);
                await loadUsers();
                if (onEmployeeListChanged) onEmployeeListChanged();
            } else {
                setFeedback({ type: "error", text: "Failed to add employee." });
            }
        }

        setLoading(false);
    };

    const confirmDelete = async () => {
        if (!deleteTarget) return;

        if (deleteTarget.email === currentUserEmail) {
            setFeedback({ type: "error", text: "You cannot delete your own admin account." });
            setDeleteTarget(null);
            return;
        }

        const res = await removeUserAccess(deleteTarget.id);
        if (res.success) {
            setFeedback({ type: "success", text: `Removed ${deleteTarget.name} from directory.` });
            await loadUsers();
            if (onEmployeeListChanged) onEmployeeListChanged();
        } else {
            setFeedback({ type: "error", text: "Failed to delete employee." });
        }
        setDeleteTarget(null);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-2 sm:p-4 select-none">
            {/* Draggable Window Container */}
            <div
                style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                }}
                className="w-full max-w-4xl border-2 border-panel-border bg-panel-bg shadow-2xl max-h-[92vh] flex flex-col font-mono text-xs"
            >
                {/* Draggable Title Bar (Cursor Grab) */}
                <div
                    onMouseDown={handleMouseDown}
                    className="flex items-center justify-between bg-header-bg px-3 py-1.5 text-header-text cursor-grab active:cursor-grabbing border-b border-black"
                    title="Click and drag to move window"
                >
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-gray-400">⠿</span>
                        <span className="font-bold uppercase tracking-wider">
                            Employee Directory & Master Management
                        </span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex h-5 w-5 items-center justify-center border border-panel-border bg-panel-bg font-bold text-app-text active:translate-y-px cursor-pointer"
                    >
                        ✕
                    </button>
                </div>

                {/* Action Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-panel-border p-2 bg-app-bg/30">
                    <span className="font-semibold text-retro-text">
                        Total Employees: {users.length}
                    </span>
                    <button
                        onClick={isFormOpen ? () => setIsFormOpen(false) : handleOpenAdd}
                        className="retro-button bg-[#1E3A2E] text-white px-3 py-1 font-bold cursor-pointer"
                    >
                        {isFormOpen ? "Close Form" : "+ Add New Employee"}
                    </button>
                </div>

                {/* Feedback Alert */}
                {feedback && (
                    <div
                        className={`p-2 font-bold border-b ${feedback.type === "success"
                                ? "bg-[#D4EDDA] text-[#155724] border-[#C3E6CB]"
                                : "bg-[#F8D7DA] text-[#721C24] border-[#F5C6CB]"
                            }`}
                    >
                        {feedback.type === "success" ? "✓" : "⚠️"} {feedback.text}
                    </div>
                )}

                {/* Form Body */}
                {isFormOpen && (
                    <form
                        onSubmit={handleFormSubmit}
                        noValidate
                        className="border-b border-panel-border bg-[#F5F7F0] p-3 grid grid-cols-1 sm:grid-cols-5 gap-2"
                    >
                        <div>
                            <label className="block font-bold mb-1">Emp ID *</label>
                            <input
                                type="text"
                                disabled={Boolean(editingUser)}
                                placeholder="Enter Employee ID"
                                value={formData.empId}
                                onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                                className="w-full border border-panel-border p-1 bg-white uppercase font-bold disabled:bg-gray-100"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1">Full Name *</label>
                            <input
                                type="text"
                                placeholder="Enter Full Name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full border border-panel-border p-1 bg-white font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1">Designation *</label>
                            <input
                                type="text"
                                placeholder="Enter Designation"
                                value={formData.designation}
                                onChange={(e) => setFormData({ ...formData, designation: e.target.value })}
                                className="w-full border border-panel-border p-1 bg-white font-semibold"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1">Official Email *</label>
                            <input
                                type="email"
                                placeholder="Enter Official Email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full border border-panel-border p-1 bg-white"
                            />
                        </div>

                        <div>
                            <label className="block font-bold mb-1">Role & Action</label>
                            <div className="flex gap-1">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="w-full border border-panel-border p-1 bg-white font-bold cursor-pointer"
                                >
                                    <option value="viewer">Viewer</option>
                                    <option value="admin">Admin</option>
                                </select>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="retro-button bg-[#1E3A2E] text-white px-2 py-1 font-bold cursor-pointer"
                                >
                                    {editingUser ? "Update" : "Save"}
                                </button>
                            </div>
                        </div>
                    </form>
                )}

                {/* Directory Table */}
                <div className="p-3 overflow-y-auto flex-1">
                    <div className="border border-table-border overflow-x-auto shadow-inner">
                        <table className="w-full border-collapse">
                            <thead>
                                <tr className="bg-header-bg text-header-text uppercase text-[11px]">
                                    <th className="border border-table-border p-1.5 text-center w-10">Sl</th>
                                    <th className="border border-table-border p-1.5 text-center w-16">Emp ID</th>
                                    <th className="border border-table-border p-1.5 text-center min-w-[140px]">Name</th>
                                    <th className="border border-table-border p-1.5 text-center min-w-[140px]">Designation</th>
                                    <th className="border border-table-border p-1.5 text-left min-w-[180px]">Email</th>
                                    <th className="border border-table-border p-1.5 text-center w-20">Role</th>
                                    <th className="border border-table-border p-1.5 text-center w-28">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="retro-cell text-center py-6 text-gray-500 italic">
                                            No employees added yet. Click &quot;+ Add New Employee&quot; above to add personnel.
                                        </td>
                                    </tr>
                                ) : (
                                    users.map((u, idx) => (
                                        <tr
                                            key={u.id || idx}
                                            className={idx % 2 === 0 ? "bg-table-row-even" : "bg-table-row-odd"}
                                        >
                                            <td className="retro-cell text-center font-bold">{idx + 1}</td>
                                            <td className="retro-cell text-center font-bold">{u.empId}</td>
                                            <td className="retro-cell text-center font-semibold">{u.name}</td>
                                            <td className="retro-cell text-center font-bold text-[#1E3A2E]">
                                                {u.designation || "Documentation"}
                                            </td>
                                            <td className="retro-cell text-left text-gray-700">{u.email}</td>
                                            <td className="retro-cell text-center">
                                                <span
                                                    className={`px-1.5 py-0.5 text-[10px] font-black uppercase ${u.role === "admin"
                                                            ? "bg-[#D4EDDA] text-[#155724]"
                                                            : "bg-[#FFF3CD] text-[#856404]"
                                                        }`}
                                                >
                                                    {u.role || "viewer"}
                                                </span>
                                            </td>
                                            <td className="retro-cell text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <button
                                                        onClick={() => handleOpenEdit(u)}
                                                        className="retro-button bg-panel-bg px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                                                    >
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => setDeleteTarget(u)}
                                                        className="retro-button bg-[#8B2626] text-white px-1.5 py-0.5 text-[10px] font-bold cursor-pointer"
                                                    >
                                                        ✕
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end border-t border-panel-border bg-app-bg/40 px-3 py-2">
                    <button
                        onClick={onClose}
                        className="retro-button bg-panel-bg px-4 py-1 font-semibold text-app-text cursor-pointer"
                    >
                        Close
                    </button>
                </div>
            </div>

            <CustomModal
                isOpen={Boolean(deleteTarget)}
                title="Delete Employee Record"
                message={`Are you sure you want to delete ${deleteTarget?.name} (${deleteTarget?.empId})?`}
                isDanger={true}
                confirmText="Delete"
                onConfirm={confirmDelete}
                onCancel={() => setDeleteTarget(null)}
            />
        </div>
    );
}