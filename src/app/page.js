"use client";

import React, { useState, useEffect } from "react";
import { listenToAuthState, logoutUser } from "../utils/authService";
import { saveWeeklyRoster, fetchWeeksByMonth } from "../utils/rosterService";
import { fetchAllUsers } from "../utils/userManagerService";
import { extractMonthFolder } from "../utils/dateUtils";
import { auth, db } from "../firebase";
import { deleteUser } from "firebase/auth";
import { deleteDoc, doc } from "firebase/firestore";

import Navbar from "../components/Navbar";
import AuthScreen from "../components/AuthScreen";
import LiveDashboard from "../components/LiveDashboard";
import RosterBuilder from "../components/RosterBuilder";
import UserManagerModal from "../components/UserManagerModal";
import COffLedgerModal from "../components/COffLedgerModal";
import DeleteAccountModal from "../components/DeleteAccountModal";
import ChangePasswordModal from "../components/ChangePasswordModal";
import AnnouncementModal from "../components/announcements/AnnouncementModal";
import CustomModal from "../components/CustomModal";

export default function Home() {
  const [currentUser, setCurrentUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isAuthorizedEmployee, setIsAuthorizedEmployee] = useState(false);
  const [activeView, setActiveView] = useState("home");

  // Modals
  const [isUserManagerOpen, setIsUserManagerOpen] = useState(false);
  const [isCOffModalOpen, setIsCOffModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAnnouncementModalOpen, setIsAnnouncementModalOpen] = useState(false);

  const [savedWeeks, setSavedWeeks] = useState([]);
  const [noticeRefreshCounter, setNoticeRefreshCounter] = useState(0);
  const [isStrangerDeleting, setIsStrangerDeleting] = useState(false);

  const [notification, setNotification] = useState({ isOpen: false, title: "", message: "" });

  useEffect(() => {
    const unsubscribe = listenToAuthState(async (user) => {
      if (!user) {
        setCurrentUser(null);
        setIsAuthorizedEmployee(false);
        setAuthLoading(false);
        return;
      }

      const isSuperAdmin =
        user.email?.toLowerCase() === "iamdebojyoti.1990@gmail.com" ||
        user.role === "admin";

      if (isSuperAdmin) {
        setCurrentUser(user);
        setIsAuthorizedEmployee(true);
        setAuthLoading(false);
        loadWeeks();
        return;
      }

      const masterList = await fetchAllUsers();
      const match = masterList.find(
        (m) => m.email?.toLowerCase() === user.email?.toLowerCase()
      );

      if (match) {
        setCurrentUser({
          ...user,
          empId: match.empId,
          name: match.name,
          designation: match.designation,
          role: match.role || "viewer",
          isApproved: true,
        });
        setIsAuthorizedEmployee(true);
        loadWeeks();
      } else {
        setCurrentUser({
          ...user,
          role: "unauthorized",
          isApproved: false,
        });
        setIsAuthorizedEmployee(false);
      }

      setAuthLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loadWeeks = async () => {
    const month = extractMonthFolder(new Date().toLocaleDateString("en-GB").replace(/\//g, "-"));
    const weeks = await fetchWeeksByMonth(month);
    setSavedWeeks(weeks);
  };

  const handlePublishRoster = async (monthFolder, weekStartDate, rosterData) => {
    const res = await saveWeeklyRoster(monthFolder, weekStartDate, rosterData, currentUser.email);
    if (res.success) {
      setNotification({
        isOpen: true,
        title: "Deployment Published",
        message: `Roster for week ${weekStartDate} successfully published!`,
      });
      loadWeeks();
      setActiveView("home");
    } else {
      setNotification({
        isOpen: true,
        title: "Publish Failed",
        message: res.error || "Could not publish roster.",
      });
    }
  };

  const handleStrangerDirectDelete = async () => {
    if (!auth.currentUser) return;
    setIsStrangerDeleting(true);
    try {
      const uid = auth.currentUser.uid;
      await deleteDoc(doc(db, "users", uid));
      await deleteUser(auth.currentUser);
      setCurrentUser(null);
      setIsAuthorizedEmployee(false);
    } catch (err) {
      await logoutUser();
      setCurrentUser(null);
    } finally {
      setIsStrangerDeleting(false);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg font-mono text-xs font-bold text-retro-text">
        Verifying Security Authorization Credentials...
      </div>
    );
  }

  if (!currentUser) {
    return <AuthScreen onAuthSuccess={setCurrentUser} />;
  }

  const isAdmin = currentUser.role === "admin";
  const isApproved = isAuthorizedEmployee && currentUser.isApproved !== false;

  // STRICT LOCK SCREEN FOR UNREGISTERED STRANGERS
  if (!isAdmin && !isApproved) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#C7CBB8] p-4 font-mono select-none">
        <div className="w-full max-w-md border-2 border-[#3D4337] bg-[#D6DACB] shadow-2xl">
          <div className="bg-[#8B2626] px-3 py-1.5 text-white flex justify-between items-center font-black text-xs uppercase">
            <span>⚠️ Access Restricted - Unauthorized Terminal</span>
            <span className="text-[10px] bg-black/40 px-1 font-mono">LOCKED</span>
          </div>

          <div className="p-4 space-y-3 text-xs">
            <p className="font-bold text-[#721C24] leading-relaxed">
              Access Denied: Your email ({currentUser.email}) is not registered in the JSW Documentation Department directory.
            </p>

            <div className="border border-[#3D4337] bg-white p-3 space-y-1 text-gray-700">
              <p>• Department: <strong>Documentation</strong></p>
              <p>• System Status: <strong className="text-red-700 uppercase">Unauthorized Personnel</strong></p>
              <p className="text-[11px] text-gray-500 pt-1">
                Please contact System Administrator <strong>Debojyoti Chakraborty</strong> to add your Employee ID into the department master.
              </p>
            </div>

            <div className="pt-2 flex justify-between items-center border-t border-[#3D4337]">
              <button
                type="button"
                disabled={isStrangerDeleting}
                onClick={handleStrangerDirectDelete}
                className="retro-button bg-[#8B2626] text-white px-3 py-1 text-[11px] font-bold cursor-pointer"
              >
                {isStrangerDeleting ? "Deleting..." : "✕ Delete My Account"}
              </button>

              <button
                type="button"
                onClick={async () => {
                  await logoutUser();
                  setCurrentUser(null);
                  setIsAuthorizedEmployee(false);
                }}
                className="retro-button bg-[#0F1F17] text-white px-4 py-1 text-xs font-bold cursor-pointer"
              >
                🚪 Sign Out
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-app-bg text-app-text font-mono flex flex-col select-none">
      {/* 1. Desktop Navbar */}
      <Navbar
        user={currentUser}
        activeView={activeView}
        onSelectView={setActiveView}
        onOpenUserManager={() => setIsUserManagerOpen(true)}
        onOpenCOffLedger={() => setIsCOffModalOpen(true)}
        onOpenNoticePost={() => setIsAnnouncementModalOpen(true)}
        onChangePassword={() => setIsChangePasswordOpen(true)}
        onSignOut={async () => {
          await logoutUser();
          setCurrentUser(null);
        }}
        onDeleteAccount={() => setIsDeleteModalOpen(true)}
      />

      {/* 2. Main Content Area */}
      <main className="flex-1 w-full max-w-[1440px] mx-auto p-2 sm:p-4 space-y-4">
        {activeView === "home" ? (
          <LiveDashboard
            savedWeeks={savedWeeks}
            onOpenBuilderForWeek={() => setActiveView("builder")}
          />
        ) : (
          <RosterBuilder
            onPublishRoster={handlePublishRoster}
            savedWeeksList={savedWeeks}
          />
        )}
      </main>

      {/* 3. Dedicated Pop-up Windows */}
      <AnnouncementModal
        isOpen={isAnnouncementModalOpen}
        onClose={() => setIsAnnouncementModalOpen(false)}
        authorName={currentUser.name || "Debojyoti"}
        onAnnouncementsUpdated={() => setNoticeRefreshCounter((c) => c + 1)}
      />

      <UserManagerModal
        isOpen={isUserManagerOpen}
        onClose={() => setIsUserManagerOpen(false)}
        currentUserEmail={currentUser.email}
      />

      <COffLedgerModal
        isOpen={isCOffModalOpen}
        onClose={() => setIsCOffModalOpen(false)}
        isAdmin={isAdmin}
        currentUser={currentUser}
      />

      {/* 🔑 Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onSuccess={() => setCurrentUser(null)}
      />

      <CustomModal
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        confirmText="Acknowledge"
        cancelText=""
        onConfirm={() => setNotification({ isOpen: false, title: "", message: "" })}
      />
    </div>
  );
}