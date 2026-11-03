import * as XLSX from "xlsx";
import { calculateTotalHours, calculateWorkingDays, calculateTotalOff, evaluateDutyCompliance } from "./rosterCalculations";

/**
 * Exports single weekly deployment to official Excel file (.xlsx)
 */
export function exportWeekToExcel(weekStartDate, weekDays, rosterRecords) {
    if (!rosterRecords || rosterRecords.length === 0) return;

    const headerRow1 = [
        "Sl", "Emp ID", "Employee Name", "Designation",
        ...weekDays.map((d) => d.displayDate),
        "Total Hrs", "Working Days", "Total Off", "Status"
    ];

    const headerRow2 = [
        "", "", "", "",
        ...weekDays.map((d) => d.dayName),
        "", "", "", ""
    ];

    const dataRows = rosterRecords.map((emp, idx) => {
        const totalHrs = calculateTotalHours(emp.shifts);
        const workingDays = calculateWorkingDays(emp.shifts);
        const totalOff = calculateTotalOff(emp.shifts);
        const compliance = evaluateDutyCompliance(totalHrs);

        return [
            idx + 1,
            emp.empId,
            emp.name,
            emp.designation || "Documentation",
            ...(emp.shifts || []),
            totalHrs,
            workingDays,
            totalOff,
            compliance.remark,
        ];
    });

    const worksheetData = [
        [`Weekly Deployment - Documentation (Week Starting: ${weekStartDate})`],
        [],
        headerRow1,
        headerRow2,
        ...dataRows,
    ];

    const ws = XLSX.utils.aoa_to_sheet(worksheetData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Deployment");

    // Trigger download
    XLSX.writeFile(wb, `Roster_${weekStartDate}.xlsx`);
}