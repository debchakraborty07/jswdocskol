"use client";

import React, { useState } from "react";
import { loginUser, registerAuthorizedUser } from "../utils/authService";

function formatAuthErrorMessage(rawError = "") {
    const err = String(rawError).toLowerCase();

    if (err.includes("email-already-in-use")) {
        return "This email is already registered. Please click 'Switch to Sign In' below.";
    }
    if (err.includes("weak-password")) {
        return "Password is too weak. Please enter at least 6 characters.";
    }
    if (err.includes("invalid-email")) {
        return "Please enter a valid email address (e.g. employee@jsw.in).";
    }
    if (err.includes("invalid-credential") || err.includes("user-not-found") || err.includes("wrong-password")) {
        return "Incorrect password or account not activated yet. Click 'First time user' below.";
    }
    return rawError || "Authentication error. Please check your email and password.";
}

export default function AuthScreen({ onAuthSuccess }) {
    const [isRegisterMode, setIsRegisterMode] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [errorMsg, setErrorMsg] = useState("");
    const [loading, setLoading] = useState(false);

    // Email format validation regex
    const isValidEmail = (val) => {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrorMsg("");

        const trimmedEmail = email.trim().toLowerCase();

        if (!trimmedEmail) {
            setErrorMsg("Please enter your email address.");
            return;
        }

        if (!isValidEmail(trimmedEmail)) {
            setErrorMsg("Invalid email format. (e.g. name@gmail.com, name@jsw.in)");
            return;
        }

        if (!password) {
            setErrorMsg("Please enter your security password.");
            return;
        }

        setLoading(true);

        try {
            if (isRegisterMode) {
                const res = await registerAuthorizedUser(trimmedEmail, password);
                if (res.success) {
                    if (onAuthSuccess) onAuthSuccess(res.user);
                } else {
                    setErrorMsg(formatAuthErrorMessage(res.error));
                }
            } else {
                const res = await loginUser(trimmedEmail, password);
                if (res.success) {
                    if (onAuthSuccess) onAuthSuccess(res.user);
                } else {
                    setErrorMsg(formatAuthErrorMessage(res.error));
                }
            }
        } catch (err) {
            setErrorMsg(formatAuthErrorMessage(err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-app-bg p-4 font-mono select-none">
            <div className="w-full max-w-sm border-2 border-panel-border bg-panel-bg shadow-2xl">
                <div className="flex items-center justify-between bg-header-bg px-3 py-1.5 text-header-text">
                    <span className="text-xs font-bold uppercase tracking-wider">
                        {isRegisterMode ? "Employee Registration" : "Department Authentication"}
                    </span>
                    <span className="text-[10px] bg-[#1E3A2E] px-1.5 py-0.5 border border-white/20 font-bold">
                        Portal v1.0
                    </span>
                </div>

                <div className="border-b border-panel-border bg-[#F5F7F0] p-3 text-center">
                    <h2 className="text-sm font-black uppercase text-header-bg">
                        Documentation Department
                    </h2>
                    <p className="text-[11px] text-gray-600 mt-0.5">
                        Operational deployment & attendance system
                    </p>
                </div>

                <form onSubmit={handleSubmit} noValidate className="p-4 space-y-3">
                    {errorMsg && (
                        <div className="border border-[#721C24] bg-[#F8D7DA] text-[#721C24] p-2 text-xs font-bold leading-snug">
                            ⚠️ {errorMsg}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-retro-text mb-1">
                            Official Email (@gmail, @outlook, @jsw.in, etc.)
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value);
                                if (errorMsg) setErrorMsg("");
                            }}
                            placeholder="e.g. employee@jsw.in"
                            className="w-full border border-panel-border p-2 bg-white text-xs outline-none focus:border-[#1E3A2E]"
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-retro-text mb-1">
                            Security Password
                        </label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => {
                                setPassword(e.target.value);
                                if (errorMsg) setErrorMsg("");
                            }}
                            placeholder="••••••••"
                            className="w-full border border-panel-border p-2 bg-white text-xs outline-none focus:border-[#1E3A2E]"
                        />
                    </div>

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="retro-button w-full bg-header-bg text-white py-2 text-xs font-extrabold uppercase tracking-wide cursor-pointer active:translate-y-px"
                        >
                            {loading
                                ? "Connecting..."
                                : isRegisterMode
                                    ? "Activate & Enter Portal"
                                    : "Sign In"}
                        </button>
                    </div>
                </form>

                <div className="border-t border-panel-border bg-app-bg/50 px-4 py-2.5 text-center text-xs">
                    <button
                        type="button"
                        onClick={() => {
                            setIsRegisterMode(!isRegisterMode);
                            setErrorMsg("");
                        }}
                        className="text-retro-forest font-bold hover:underline cursor-pointer"
                    >
                        {isRegisterMode
                            ? "Already registered? Switch to Sign In"
                            : "First time user? Click here to set password"}
                    </button>
                </div>
            </div>
        </div>
    );
}