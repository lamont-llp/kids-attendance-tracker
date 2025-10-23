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

function formatAttendanceForExport(records: AttendanceRecord[]) {
  return records.map((record) => ({
    'Date': record.date,
    'Student Name': record.kid?.name || '',
    'Age Group': record.kid?.age || '',
    'Status': record.present ? 'Present' : 'Absent',
    'Check-in Time': record.date ? new Date(record.date).toLocaleTimeString() : '',
    'Visitor': record.kid?.isVisitor ? 'Yes' : 'No',
  }));
}

export function exportToCSV(records: AttendanceRecord[], options: ExportOptions = {}) {
  const { fileName, includeHeaders } = { ...defaultOptions, ...options };
  const formattedData = formatAttendanceForExport(records);
  
  if (formattedData.length === 0) {
    throw new Error('No data to export');
  }

  const headers = Object.keys(formattedData[0] as object);
  const csvContent = [
    ...(includeHeaders ? [headers.join(',')] : []),
    ...formattedData.map(row => 
      headers.map(header => {
        const cell = row[header as keyof typeof row];
        return typeof cell === 'string' && cell.includes(',') 
          ? `"${cell}"`
          : cell;
      }).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
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