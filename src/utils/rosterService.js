import { db } from "../firebase";
import {
    doc,
    setDoc,
    getDoc,
    collection,
    query,
    where,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";
import { parseDDMMYYYY } from "./dateUtils";

const COLLECTION_NAME = "weekly_rosters";

/**
 * Saves or updates a weekly deployment roster with human-readable timestamp
 */
export async function saveWeeklyRoster(
    yearMonth,
    weekStartDate,
    rosterRecords,
    savedByEmail = "admin"
) {
    try {
        const documentId = `${yearMonth}_${weekStartDate}`;
        const docRef = doc(db, COLLECTION_NAME, documentId);

        const now = new Date();
        const day = String(now.getDate()).padStart(2, "0");
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const year = now.getFullYear();
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const formattedTimestamp = `${day}-${month}-${year}, ${hours}:${minutes}`;

        const payload = {
            yearMonth,
            weekStartDate,
            department: "Documentation",
            records: rosterRecords,
            savedBy: savedByEmail,
            published: true,
            updatedAt: serverTimestamp(),
            updatedAtDisplay: formattedTimestamp,
        };

        await setDoc(docRef, payload, { merge: true });
        return { success: true, timestamp: formattedTimestamp };
    } catch (error) {
        console.error("Error saving roster to Firestore:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches a specific weekly roster by Month and Start Date
 */
export async function fetchWeeklyRoster(yearMonth, weekStartDate) {
    try {
        const documentId = `${yearMonth}_${weekStartDate}`;
        const docRef = doc(db, COLLECTION_NAME, documentId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { success: true, data: docSnap.data() };
        }
        return { success: false, data: null, error: "No roster found for this week." };
    } catch (error) {
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all saved weeks inside a month sorted chronologically (e.g. 02-11 then 09-11)
 */
export async function fetchWeeksByMonth(yearMonth) {
    try {
        const q = query(
            collection(db, COLLECTION_NAME),
            where("yearMonth", "==", yearMonth)
        );

        const snapshot = await getDocs(q);
        const weeks = [];
        snapshot.forEach((doc) => {
            weeks.push(doc.data().weekStartDate);
        });

        // Chronological Sort: Oldest to Newest (02-11-2026 comes BEFORE 09-11-2026)
        return weeks.sort((a, b) => parseDDMMYYYY(a) - parseDDMMYYYY(b));
    } catch (error) {
        return [];
    }
}

/**
 * Fetches all rosters across the entire database for Monthly / Full export
 */
export async function fetchAllRostersForExport() {
    try {
        const snapshot = await getDocs(collection(db, COLLECTION_NAME));
        const all = [];
        snapshot.forEach((d) => all.push(d.data()));
        return all;
    } catch (error) {
        return [];
    }
}