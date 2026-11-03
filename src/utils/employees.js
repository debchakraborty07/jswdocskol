/**
 * Default Factory for Roster Rows
 */
export const INITIAL_EMPLOYEES = [];

export function createDefaultWeeklyRoster(employeeList = []) {
    return (employeeList || []).map((emp) => ({
        empId: emp.empId,
        name: emp.name,
        designation: emp.designation || "Documentation",
        shifts: ["OFF", "OFF", "OFF", "OFF", "OFF", "OFF", "OFF"],
    }));
}