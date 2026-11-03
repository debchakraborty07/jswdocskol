/**
 * Shift Definition and Working Hours Map
 * Directly mapped from the official department schedule
 */
export const STANDARD_WEEKLY_HOURS = 48;

export const SHIFT_SCHEDULE = {
    A: { label: "7am to 2pm", hours: 7, isWork: true, isNight: false, isDay: true },
    B: { label: "2pm to 9pm", hours: 7, isWork: true, isNight: false, isDay: true },
    C: { label: "9pm to 7am", hours: 10, isWork: true, isNight: true, isDay: false },
    G: { label: "9am to 6pm", hours: 9, isWork: true, isNight: false, isDay: true },
    D: { label: "7am to 7pm", hours: 12, isWork: true, isNight: false, isDay: true },
    N: { label: "7pm to 7am", hours: 12, isWork: true, isNight: true, isDay: false },
    VL: { label: "Vacation Leave", hours: 0, isWork: false, isNight: false, isDay: false },
    SL: { label: "Sick Leave", hours: 0, isWork: false, isNight: false, isDay: false },
    "C-OFF": { label: "Compensatory Off", hours: 0, isWork: false, isNight: false, isDay: false },
    OFF: { label: "Weekly Off", hours: 0, isWork: false, isNight: false, isDay: false },
    Absent: { label: "Absent", hours: 0, isWork: false, isNight: false, isDay: false },
};

export const SHIFT_KEYS = Object.keys(SHIFT_SCHEDULE);

export const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

/**
 * Calculates total worked hours for an employee's weekly shifts
 */
export function calculateTotalHours(shifts = []) {
    return shifts.reduce((total, shiftKey) => {
        const shift = SHIFT_SCHEDULE[shiftKey];
        return total + (shift ? shift.hours : 0);
    }, 0);
}

/**
 * Calculates total working days (days with active work hours)
 */
export function calculateWorkingDays(shifts = []) {
    return shifts.filter((shiftKey) => {
        const shift = SHIFT_SCHEDULE[shiftKey];
        return shift && shift.isWork;
    }).length;
}

/**
 * Calculates total off days (OFF or C-OFF)
 */
export function calculateTotalOff(shifts = []) {
    return shifts.filter(
        (shiftKey) => shiftKey === "OFF" || shiftKey === "C-OFF"
    ).length;
}

/**
 * Evaluates duty compliance against standard 48 hours
 */
export function evaluateDutyCompliance(totalHours) {
    if (totalHours === STANDARD_WEEKLY_HOURS) {
        return {
            status: "STANDARD",
            remark: "Standard (48h)",
            isOverDuty: false,
            isUnderDuty: false,
        };
    }

    if (totalHours > STANDARD_WEEKLY_HOURS) {
        const extra = totalHours - STANDARD_WEEKLY_HOURS;
        return {
            status: "OVER_DUTY",
            remark: `Over Duty (+${extra}h)`,
            isOverDuty: true,
            isUnderDuty: false,
        };
    }

    const shortage = STANDARD_WEEKLY_HOURS - totalHours;
    return {
        status: "UNDER_DUTY",
        remark: `Short (-${shortage}h)`,
        isOverDuty: false,
        isUnderDuty: true,
    };
}

/**
 * Returns Tailwind CSS styling for Total Hours cell based on 48h limit
 */
export function getDutyHoursCellClass(totalHours) {
    if (totalHours > STANDARD_WEEKLY_HOURS) {
        return "bg-[#F8D7DA] text-[#721C24] font-black border border-[#721C24]";
    }
    if (totalHours < STANDARD_WEEKLY_HOURS) {
        return "bg-[#FFF3CD] text-[#856404] font-bold";
    }
    return "text-[#1E3A2E] font-black";
}

/**
 * Calculates column-wise daily deployment summary across all employees
 * Now includes A, B, C, G, D, N, Total Day, and Total Night
 */
export function calculateDailySummary(employees = []) {
    const summary = {
        totalA: Array(7).fill(0),
        totalB: Array(7).fill(0),
        totalC: Array(7).fill(0),
        totalG: Array(7).fill(0),
        totalD: Array(7).fill(0),
        totalN: Array(7).fill(0),
        totalDay: Array(7).fill(0),
        totalNight: Array(7).fill(0),
    };

    employees.forEach((emp) => {
        (emp.shifts || []).forEach((shiftKey, dayIndex) => {
            if (dayIndex >= 7) return;

            if (shiftKey === "A") summary.totalA[dayIndex]++;
            if (shiftKey === "B") summary.totalB[dayIndex]++;
            if (shiftKey === "C") summary.totalC[dayIndex]++;
            if (shiftKey === "G") summary.totalG[dayIndex]++;
            if (shiftKey === "D") summary.totalD[dayIndex]++;
            if (shiftKey === "N") summary.totalN[dayIndex]++;

            // Day shifts aggregate: A (7h), B (7h), G (9h), D (12h)
            if (["A", "B", "G", "D"].includes(shiftKey)) {
                summary.totalDay[dayIndex]++;
            }

            // Night shifts aggregate: C (10h), N (12h)
            if (["C", "N"].includes(shiftKey)) {
                summary.totalNight[dayIndex]++;
            }
        });
    });

    return summary;
}

/**
 * Helper to return 90s style retro badge CSS for each shift
 * @param {string} shiftKey
 * @returns {string} Tailwind CSS class string
 */
export function getShiftBadgeClass(shiftKey) {
    switch (shiftKey) {
        case "A":
            return "bg-[#D4EDDA] text-[#155724] font-bold";
        case "B":
            return "bg-[#FFF3CD] text-[#856404] font-bold";
        case "C":
            return "bg-[#CCE5FF] text-[#004085] font-bold";
        case "OFF":
        case "C-OFF":
            return "bg-[#F8D7DA] text-[#721C24] font-bold";
        case "Absent":
            return "bg-[#3D4337] text-white font-bold";
        default:
            return "bg-transparent text-app-text";
    }
}