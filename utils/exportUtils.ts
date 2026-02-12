import { AttendanceRecord } from './schema';
import * as XLSX from 'xlsx';

export type ExportFormat = 'csv' | 'excel';

interface ExportOptions {
  fileName?: string;
  includeHeaders?: boolean;
}

const defaultOptions: ExportOptions = {
  fileName: 'attendance-export',
  includeHeaders: true,
};

/**
 * Formats attendance records for export to CSV or Excel
 */
function formatAttendanceForExport(records: AttendanceRecord[]) {
  return records.map((record) => ({
    'Date': record.date,
    'Student Name': record.kid?.name || '',
    'Age Group': record.kid?.age || '',
    'Status': record.present ? 'Present' : 'Absent',
    'Check-in Time': record.checkInTime ? new Date(record.checkInTime).toLocaleTimeString() : 'N/A',
    'Visitor': record.kid?.isVisitor ? 'Yes' : 'No',
  }));
}

/**
 * Escapes a CSV cell value according to RFC 4180 standard
 * @param cell - The cell value to escape
 * @returns Properly escaped string for CSV
 */
function escapeCsvCell(cell: any): string {
  if (cell === null || cell === undefined) {
    return '';
  }
  
  const cellStr = String(cell);
  
  // Check if cell needs quoting (contains comma, quote, or newline)
  if (cellStr.includes(',') || cellStr.includes('"') || cellStr.includes('\n') || cellStr.includes('\r')) {
    // Escape quotes by doubling them, then wrap in quotes
    return `"${cellStr.replace(/"/g, '""')}"`;
  }
  
  return cellStr;
}

/**
 * Exports attendance records to CSV format with proper UTF-8 encoding
 */
export function exportToCSV(records: AttendanceRecord[], options: ExportOptions = {}) {
  const { fileName, includeHeaders } = { ...defaultOptions, ...options };
  const formattedData = formatAttendanceForExport(records);
  
  if (formattedData.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(formattedData[0] as object);
  const csvContent = [
    ...(includeHeaders ? [headers.map(h => escapeCsvCell(h)).join(',')] : []),
    ...formattedData.map(row => 
      headers.map(header => escapeCsvCell(row[header as keyof typeof row])).join(',')
    ),
  ].join('\n');

  // Add UTF-8 BOM for Excel compatibility
  const BOM = '\uFEFF';
  const blob = new Blob([BOM + csvContent], { type: 'text/csv;charset=utf-8;' });
  return { blob, fileName: `${fileName}.csv` };
}

export function exportToExcel(records: AttendanceRecord[], options: ExportOptions = {}) {
  const { fileName } = { ...defaultOptions, ...options };
  const formattedData = formatAttendanceForExport(records);
  
  if (formattedData.length === 0) {
    throw new Error('No data to export');
  }

  const worksheet = XLSX.utils.json_to_sheet(formattedData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Attendance');
  
  const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
  const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  
  return { blob, fileName: `${fileName}.xlsx` };
}

export function downloadBlob({ blob, fileName }: { blob: Blob; fileName: string }) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}