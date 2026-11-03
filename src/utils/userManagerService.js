import { db } from "../firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    updateDoc,
    deleteDoc,
    serverTimestamp,
} from "firebase/firestore";

const USERS_COLLECTION = "employees_master";

export const SUPER_ADMIN_PROFILE = {
    empId: "JT88",
    name: "Debojyoti Chakraborty",
    designation: "Documentation Officer",
    email: "iamdebojyoti.1990@gmail.com",
    role: "admin",
};

/**
 * Fetches all master employees from Firestore.
 * PERMANENT FIX: Always returns employees strictly sorted A to Z by Name!
 */
export async function fetchAllUsers() {
    try {
        const adminDocRef = doc(db, USERS_COLLECTION, SUPER_ADMIN_PROFILE.empId);
        const adminSnap = await getDoc(adminDocRef);

        if (!adminSnap.exists()) {
            await setDoc(adminDocRef, {
                ...SUPER_ADMIN_PROFILE,
                createdAt: serverTimestamp(),
            });
        }

        const snapshot = await getDocs(collection(db, USERS_COLLECTION));
        const users = [];
        snapshot.forEach((d) => {
            users.push({ id: d.id, ...d.data() });
        });

        // Permanent Global Alphabetical Sort: A to Z by Employee Name
        return users.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } catch (error) {
        console.error("Error fetching users:", error);
        return [SUPER_ADMIN_PROFILE];
    }
}

export async function addNewAuthorizedUser(userData) {
    try {
        const cleanId = userData.empId.trim().toUpperCase();
        const docRef = doc(db, USERS_COLLECTION, cleanId);

        await setDoc(
            docRef,
            {
                empId: cleanId,
                name: userData.name.trim(),
                designation: userData.designation.trim() || "Documentation",
                email: userData.email.trim().toLowerCase(),
                role: userData.role || "viewer",
                createdAt: serverTimestamp(),
            },
            { merge: true }
        );

        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function updateEmployeeDetails(docId, updatedData) {
    try {
        const docRef = doc(db, USERS_COLLECTION, docId);
        await updateDoc(docRef, {
            name: updatedData.name.trim(),
            designation: updatedData.designation.trim(),
            email: updatedData.email.trim().toLowerCase(),
            role: updatedData.role,
            updatedAt: serverTimestamp(),
        });
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function removeUserAccess(docId) {
    try {
        await deleteDoc(doc(db, USERS_COLLECTION, docId));
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}