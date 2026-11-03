import { auth, db } from "../firebase";
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut,
    deleteUser,
    updatePassword,
    onAuthStateChanged,
    EmailAuthProvider,
    reauthenticateWithCredential,
} from "firebase/auth";
import {
    doc,
    setDoc,
    deleteDoc,
    collection,
    getDocs,
    query,
    where,
    serverTimestamp,
} from "firebase/firestore";

export const SUPER_ADMIN_EMAIL = "iamdebojyoti.1990@gmail.com";

/**
 * Checks if email belongs to Super Admin or is registered in employees_master
 */
export async function getAuthorizedUserConfig(email) {
    if (!email) return null;
    const cleanEmail = email.trim().toLowerCase();

    // 1. Super Admin Check
    if (cleanEmail === SUPER_ADMIN_EMAIL.toLowerCase()) {
        return {
            email: cleanEmail,
            empId: "JT88",
            name: "Debojyoti Chakraborty",
            designation: "Documentation Officer",
            role: "admin",
            isApproved: true,
        };
    }

    // 2. Verified check from Firestore employees_master
    try {
        const q = query(
            collection(db, "employees_master"),
            where("email", "==", cleanEmail)
        );
        const snap = await getDocs(q);
        if (!snap.empty) {
            const data = snap.docs[0].data();
            return {
                email: data.email,
                empId: data.empId || "EMP",
                name: data.name || cleanEmail.split("@")[0],
                designation: data.designation || "Documentation",
                role: data.role || "viewer",
                isApproved: true,
            };
        }
    } catch (err) {
        // Silent fail
    }

    // 3. Unknown Stranger: Unapproved (Will be held at lock screen)
    return {
        email: cleanEmail,
        empId: "",
        name: cleanEmail.split("@")[0],
        designation: "",
        role: "unauthorized",
        isApproved: false,
    };
}

export async function loginUser(email, password) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const userCredential = await signInWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        const authConfig = await getAuthorizedUserConfig(cleanEmail);

        const userData = {
            uid: user.uid,
            email: cleanEmail,
            name: authConfig.name,
            empId: authConfig.empId,
            designation: authConfig.designation,
            role: authConfig.role,
            isApproved: authConfig.isApproved,
        };

        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, { ...userData, updatedAt: serverTimestamp() }, { merge: true });

        return { success: true, user: userData };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Allows valid email format to register, sets approval status based on directory
 */
export async function registerAuthorizedUser(email, password) {
    try {
        const cleanEmail = email.trim().toLowerCase();
        const authConfig = await getAuthorizedUserConfig(cleanEmail);

        const userCredential = await createUserWithEmailAndPassword(auth, cleanEmail, password);
        const user = userCredential.user;

        const profileData = {
            uid: user.uid,
            email: cleanEmail,
            empId: authConfig.empId,
            name: authConfig.name,
            designation: authConfig.designation,
            role: authConfig.role,
            isApproved: authConfig.isApproved, // true for employee, false for stranger
            createdAt: serverTimestamp(),
        };

        await setDoc(doc(db, "users", user.uid), profileData);
        return { success: true, user: profileData };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function logoutUser() {
    try {
        await signOut(auth);
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

export async function changeCurrentUserPassword(currentPassword, newPassword) {
    const user = auth.currentUser;
    if (!user) return { success: false, error: "No active user session." };

    try {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
        await updatePassword(user, newPassword);
        return { success: true };
    } catch (error) {
        const code = error?.code || "";
        if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
            return { success: false, error: "Current password is incorrect." };
        }
        if (code === "auth/weak-password") {
            return { success: false, error: "New password must be at least 6 characters long." };
        }
        return { success: false, error: "Failed to update password." };
    }
}

export async function deleteCurrentAccountWithPassword(password) {
    const currentUser = auth.currentUser;
    if (!currentUser) return { success: false, error: "No active user session found." };

    try {
        const credential = EmailAuthProvider.credential(currentUser.email, password);
        await reauthenticateWithCredential(currentUser, credential);
        await deleteDoc(doc(db, "users", currentUser.uid));
        await deleteUser(currentUser);
        return { success: true };
    } catch (error) {
        const code = error?.code || "";
        if (code === "auth/wrong-password" || code === "auth/invalid-credential") {
            return { success: false, error: "Incorrect password. Account deletion aborted." };
        }
        return { success: false, error: "Verification failed. Please check your password." };
    }
}

export function listenToAuthState(callback) {
    return onAuthStateChanged(auth, async (user) => {
        if (user) {
            const cleanEmail = user.email.toLowerCase();
            const authConfig = await getAuthorizedUserConfig(cleanEmail);

            const resolvedData = {
                uid: user.uid,
                email: cleanEmail,
                name: authConfig.name,
                empId: authConfig.empId,
                designation: authConfig.designation,
                role: authConfig.role,
                isApproved: authConfig.isApproved,
            };

            callback(resolvedData);
        } else {
            callback(null);
        }
    });
}