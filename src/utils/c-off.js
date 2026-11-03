import { db } from "../firebase";
import {
    doc,
    getDoc,
    setDoc,
    collection,
    getDocs,
    serverTimestamp,
} from "firebase/firestore";

const C_OFF_COLLECTION = "c_off_ledger";

/**
 * Validates weekly 48-hour shift compliance rules
 */
export function validateDutyOffRule(shifts = []) {
    const workingDays = shifts.filter(
        (s) => !["OFF", "C-OFF", "VL", "SL", "Absent"].includes(s)
    ).length;

    const totalOffDays = shifts.filter(
        (s) => s === "OFF" || s === "C-OFF"
    ).length;

    if (workingDays === 4 && totalOffDays < 3) {
        return {
            isCompliant: false,
            message: "Non-compliant: 4 working days requires minimum 3 days OFF/C-OFF.",
        };
    }

    if (workingDays === 6 && totalOffDays < 1) {
        return {
            isCompliant: false,
            message: "Non-compliant: 6 working days requires at least 1 day OFF/C-OFF.",
        };
    }

    return { isCompliant: true, message: "Schedule compliant." };
}

/**
 * Extracts C-OFF occurrences from weekly roster safely
 */
export function extractCOffUsageFromRoster(rosterRecords = [], weekDaysAndDates = []) {
    const availedList = [];

    rosterRecords.forEach((emp) => {
        (emp.shifts || []).forEach((shiftKey, dayIndex) => {
            if (shiftKey === "C-OFF" && weekDaysAndDates[dayIndex]) {
                const dayInfo = weekDaysAndDates[dayIndex];
                availedList.push({
                    empId: String(emp.empId || "UNKNOWN"),
                    empName: String(emp.name || "Employee"),
                    date: String(dayInfo.fullDate || dayInfo.date || "Unknown"),
                    day: String(dayInfo.dayName || dayInfo.day || "Day"),
                    recordedAt: new Date().toISOString(),
                });
            }
        });
    });

    return availedList;
}

/**
 * Fetches C-OFF record for a single employee
 */
export async function getEmployeeCOffLedger(empId) {
    try {
        const docRef = doc(db, C_OFF_COLLECTION, empId);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data();
            const earned = Number(data.earned || 0);
            const availed = Number(data.availed || 0);
            return {
                empId,
                empName: data.empName || "",
                earned,
                availed,
                balance: earned - availed,
                history: data.history || [],
            };
        }

        return { empId, empName: "", earned: 0, availed: 0, balance: 0, history: [] };
    } catch (error) {
        return { empId, earned: 0, availed: 0, balance: 0, history: [] };
    }
}

/**
 * Automatically syncs availed C-OFF from published weekly roster.
 * Deducts automatically from Earned balance without double-counting!
 */
export async function syncRosterCOffToDatabase(availedEntries = []) {
    for (const entry of availedEntries) {
        try {
            const current = await getEmployeeCOffLedger(entry.empId);

            // Check if this date was already counted
            const alreadyLogged = current.history.some(
                (h) => h.type === "AVAILED" && h.date === entry.date
            );

            if (!alreadyLogged) {
                const updatedHistory = [
                    ...current.history,
                    {
                        type: "AVAILED",
                        date: entry.date,
                        day: entry.day,
                        notes: "Availed in weekly published roster",
                    },
                ];

                const newAvailed = current.availed + 1;

                await setDoc(
                    doc(db, C_OFF_COLLECTION, entry.empId),
                    {
                        empId: entry.empId,
                        empName: entry.empName,
                        earned: Number(current.earned),
                        availed: Number(newAvailed),
                        balance: Number(current.earned - newAvailed),
                        history: updatedHistory,
                        lastUpdated: serverTimestamp(),
                    },
                    { merge: true }
                );
            }
        } catch (err) {
            console.error(`Sync error for ${entry.empId}:`, err);
        }
    }
}

/**
 * Sets previous unused Opening C-OFFs or resets base balances manually
 */
export async function adjustEmployeeCOffLedger(empId, empName, { earned = 0, availed = 0, remarks = "Opening Balance" }) {
    try {
        const current = await getEmployeeCOffLedger(empId);
        const targetEarned = Math.max(0, Number(earned));
        const targetAvailed = Math.max(0, Number(availed));

        const updatedHistory = [
            ...current.history.filter((h) => h.type !== "OPENING_BALANCE"),
            {
                type: "OPENING_BALANCE",
                date: new Date().toLocaleDateString("en-GB").replace(/\//g, "-"),
                count: targetEarned,
                notes: remarks || "Previous Unused C-OFF set by Admin",
            },
        ];

        await setDoc(
            doc(db, C_OFF_COLLECTION, empId),
            {
                empId,
                empName: empName || current.empName,
                earned: targetEarned,
                availed: targetAvailed,
                balance: targetEarned - targetAvailed,
                history: updatedHistory,
                lastUpdated: serverTimestamp(),
            },
            { merge: true }
        );

        return { success: true };
    } catch (error) {
        console.error("Error setting opening balance:", error);
        return { success: false, error: error.message };
    }
}

/**
 * Fetches all employees C-OFF summaries
 */
export async function getAllEmployeesCOffSummary() {
    try {
        const snapshot = await getDocs(collection(db, C_OFF_COLLECTION));
        const summaries = [];
        snapshot.forEach((d) => {
            const data = d.data();
            const earned = Number(data.earned || 0);
            const availed = Number(data.availed || 0);
            summaries.push({
                empId: data.empId,
                empName: data.empName,
                earned,
                availed,
                balance: earned - availed,
                history: data.history || [],
            });
        });
        return summaries;
    } catch (error) {
        return [];
    }
}