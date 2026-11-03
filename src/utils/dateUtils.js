/**
 * Date Utility Module
 * Enforces DD-MM-YYYY format across the roster application
 */

const MONTH_NAMES = [
    "Jan", "Feb", "Mar", "Apr", "May", "Jun",
    "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

/**
 * Formats a JavaScript Date object into strictly DD-MM-YYYY
 * @param {Date} date
 * @returns {string} e.g. "16-11-2026"
 */
export function formatToDDMMYYYY(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}

/**
 * Converts a DD-MM-YYYY string back to a Date object
 * @param {string} dateStr - Format "DD-MM-YYYY"
 * @returns {Date}
 */
export function parseDDMMYYYY(dateStr) {
    const [day, month, year] = dateStr.split("-").map(Number);
    return new Date(year, month - 1, day);
}

/**
 * Formats date for display in the Excel table header (e.g. "16-Nov")
 * @param {Date} date
 * @returns {string} e.g. "16-Nov"
 */
export function formatToDisplayHeader(date) {
    const day = String(date.getDate()).padStart(2, "0");
    const monthName = MONTH_NAMES[date.getMonth()];
    return `${day}-${monthName}`;
}

/**
 * Extracts Month-Year folder key in MM-YYYY format
 * @param {string} dateStr - Format "DD-MM-YYYY"
 * @returns {string} e.g. "11-2026"
 */
export function extractMonthFolder(dateStr) {
    const parts = dateStr.split("-");
    if (parts.length === 3) {
        return `${parts[1]}-${parts[2]}`;
    }
    return dateStr;
}

/**
 * Returns the Monday of the given date's week
 * @param {Date} d
 * @returns {Date}
 */
export function getMondayOfWeek(d = new Date()) {
    const date = new Date(d);
    const day = date.getDay();
    // Sunday is 0, Monday is 1...
    const diff = date.getDate() - day + (day === 0 ? -6 : 1);
    date.setDate(diff);
    date.setHours(0, 0, 0, 0);
    return date;
}

/**
 * Generates array of 7 consecutive days starting from a given Monday
 * Exactly matches Row 4 and Row 5 of the deployment excel sheet
 * @param {Date|string} mondayInput - Date object or "DD-MM-YYYY" string
 * @returns {Array<{ dayName: string, displayDate: string, fullDate: string }>}
 */
export function generateWeekDaysAndDates(mondayInput = new Date()) {
    const monday =
        typeof mondayInput === "string"
            ? parseDDMMYYYY(mondayInput)
            : getMondayOfWeek(mondayInput);

    const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const weekList = [];

    for (let i = 0; i < 7; i++) {
        const current = new Date(monday);
        current.setDate(monday.getDate() + i);

        weekList.push({
            dayName: daysOfWeek[i],               // e.g. "Mon"
            displayDate: formatToDisplayHeader(current), // e.g. "16-Nov"
            fullDate: formatToDDMMYYYY(current),         // e.g. "16-11-2026"
        });
    }

    return weekList;
}