import { SHIFT_SCHEDULE } from "./rosterCalculations";

/**
 * Validates shift transition legality based on rest hours:
 * - C -> A is FORBIDDEN (0h rest)
 * - B -> C is FORBIDDEN (0h rest)
 * - A -> C, A -> B, C -> B, B -> A are ALLOWED
 */
export function isAllowedTransition(prevShift, nextShift) {
    if (!prevShift || prevShift === "OFF" || prevShift === "C-OFF") return true;
    if (!nextShift || nextShift === "OFF" || nextShift === "C-OFF") return true;

    if (prevShift === "C" && nextShift === "A") return false;
    if (prevShift === "B" && nextShift === "C") return false;

    return true;
}

/**
 * 4 COMPLIANT 48-HOUR PATTERNS
 * Every pattern has: 2 C's (20h) + 4 A/B's (28h) + 1 OFF (0h) = EXACTLY 48 HOURS!
 * Exactly 6 working days, Exactly 1 Day OFF.
 * Zero illegal transitions (Never C->A, Never B->C).
 */
const COMPLIANT_48H_PATTERNS = [
    // Pattern 1: A -> A -> C -> C -> B -> B -> OFF (48h)
    ["A", "A", "C", "C", "B", "B", "OFF"],

    // Pattern 2: C -> C -> B -> B -> A -> A -> OFF (48h)
    ["C", "C", "B", "B", "A", "A", "OFF"],

    // Pattern 3: A -> C -> C -> B -> B -> A -> OFF (48h)
    ["A", "C", "C", "B", "B", "A", "OFF"],

    // Pattern 4: C -> B -> B -> A -> A -> C -> OFF (48h)
    ["C", "B", "B", "A", "A", "C", "OFF"],
];

/**
 * Rotates an array to the left by n positions
 */
function rotateArray(arr, n) {
    const len = arr.length;
    const shift = ((n % len) + len) % len;
    return [...arr.slice(shift), ...arr.slice(0, shift)];
}

/**
 * Smart Auto-Roster Generator with Multi-Click Variation Support
 * Every click generates a fresh, perfectly balanced 48-hour schedule.
 * @param {Array} currentEmployees - Roster employee list
 * @param {Object} prevSundayShifts - Previous week's Sunday shifts
 * @param {number} seed - Increments on every click to generate new variations
 * @returns {Array} Updated employees with balanced shifts
 */
export function generateSmartRoster(currentEmployees = [], prevSundayShifts = {}, seed = 0) {
    if (!currentEmployees || currentEmployees.length === 0) return [];

    const totalEmployees = currentEmployees.length;

    return currentEmployees.map((emp, empIdx) => {
        // Dynamic pattern selection based on employee index and generation click seed
        const patternIdx = (empIdx + seed) % COMPLIANT_48H_PATTERNS.length;
        let basePattern = [...COMPLIANT_48H_PATTERNS[patternIdx]];

        // Shift day offset per employee so they don't take OFF on the same day
        const dayOffset = (empIdx * 2 + seed) % 7;
        let assignedShifts = rotateArray(basePattern, dayOffset);

        // Validate Monday transition against previous week's Sunday
        const prevSunday = prevSundayShifts[emp.empId];
        if (prevSunday && !isAllowedTransition(prevSunday, assignedShifts[0])) {
            if (prevSunday === "C") {
                assignedShifts[0] = "B"; // C -> B is allowed
            } else if (prevSunday === "B") {
                assignedShifts[0] = "A"; // B -> A is allowed
            }
        }

        return {
            ...emp,
            shifts: assignedShifts,
        };
    });
}