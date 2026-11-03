/**
 * Shift Styling & Schedule Legend Master
 * Provides soft pastel background colors with crisp dark text
 * Directly mapped to the Documentation Department Working Schedule
 */

export const SHIFT_DETAILS = {
    A: {
        code: "A",
        time: "7am to 2pm",
        hrs: 7,
        type: "Day",
        // Light Pastel Mint Green
        badgeClass: "bg-[#D4EDDA] text-[#155724] border border-[#C3E6CB] font-bold",
    },
    B: {
        code: "B",
        time: "2pm to 9pm",
        hrs: 7,
        type: "Day",
        // Light Butter Yellow
        badgeClass: "bg-[#FFF3CD] text-[#856404] border border-[#FFEEBA] font-bold",
    },
    C: {
        code: "C",
        time: "9pm to 7am",
        hrs: 10,
        type: "Night",
        // Soft Ice Blue
        badgeClass: "bg-[#CCE5FF] text-[#004085] border border-[#B8DAFF] font-bold",
    },
    G: {
        code: "G",
        time: "9am to 6pm",
        hrs: 9,
        type: "Day",
        // Light Teal / Cyan
        badgeClass: "bg-[#D1ECF1] text-[#0C5460] border border-[#BEE5EB] font-bold",
    },
    D: {
        code: "D",
        time: "7am to 7pm",
        hrs: 12,
        type: "Day",
        // Soft Lavender / Purple
        badgeClass: "bg-[#E8DAEF] text-[#5B2C6F] border border-[#D7BDE2] font-bold",
    },
    N: {
        code: "N",
        time: "7pm to 7am",
        hrs: 12,
        type: "Night",
        // Soft Periwinkle / Light Indigo
        badgeClass: "bg-[#E0E7FF] text-[#312E81] border border-[#C7D2FE] font-bold",
    },
    VL: {
        code: "VL",
        time: "-",
        hrs: 0,
        type: "Leave",
        // Soft Cool Grey
        badgeClass: "bg-[#E2E3E5] text-[#383D41] border border-[#D6D8DB] font-semibold",
    },
    SL: {
        code: "SL",
        time: "-",
        hrs: 0,
        type: "Leave",
        // Soft Peach / Light Orange
        badgeClass: "bg-[#FFE0B2] text-[#E65100] border border-[#FFCC80] font-semibold",
    },
    "C-OFF": {
        code: "C-OFF",
        time: "-",
        hrs: 0,
        type: "Off",
        // Soft Rose / Magenta
        badgeClass: "bg-[#FCE4EC] text-[#880E4F] border border-[#F8BBD0] font-bold",
    },
    OFF: {
        code: "OFF",
        time: "-",
        hrs: 0,
        type: "Off",
        // Soft Pastel Coral / Red
        badgeClass: "bg-[#F8D7DA] text-[#721C24] border border-[#F5C6CB] font-bold",
    },
    Absent: {
        code: "Absent",
        time: "-",
        hrs: 0,
        type: "Leave",
        // Charcoal Dark Accent
        badgeClass: "bg-[#3D4337] text-white border border-black font-bold",
    },
};

/**
 * Returns the exact Tailwind CSS class for any given shift code
 * @param {string} shiftCode
 * @returns {string}
 */
export function getShiftStyle(shiftCode) {
    if (SHIFT_DETAILS[shiftCode]) {
        return SHIFT_DETAILS[shiftCode].badgeClass;
    }
    return "bg-transparent text-app-text";
}

/**
 * Array of all shifts for rendering the bottom-left "Working Schedule" legend table
 */
export const WORKING_SCHEDULE_LEGEND = Object.values(SHIFT_DETAILS);