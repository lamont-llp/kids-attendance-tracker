"use client";

import React from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, CheckCircle2, XCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { AttendanceRecord } from "@/utils/schema";
import moment from "moment";
import { DateRange } from "react-day-picker";

interface AttendanceTableProps {
  attendanceList?: AttendanceRecord[];
  dateRange?: DateRange;
}

const AttendanceTable: React.FC<AttendanceTableProps> = ({ attendanceList, dateRange }) => {
  // Handle undefined or empty state
  if (!attendanceList) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">No search performed yet.</p>
          <p className="text-sm text-muted-foreground">Select a date range and age group, then click Search.</p>
        </div>
      </div>
    );
  }

  if (attendanceList.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 px-4">
        <div className="text-center space-y-2">
          <XCircle className="h-12 w-12 text-muted-foreground mx-auto" />
          <p className="text-muted-foreground">No attendance records found.</p>
          <p className="text-sm text-muted-foreground">Try adjusting your search criteria.</p>
        </div>
      </div>
    );
  }

  const columns: ColumnDef<AttendanceRecord>[] = [
    {
      accessorKey: "kid.name",
      id: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const name = row.original.kid?.name || "Unknown";
        const isVisitor = row.original.kid?.isVisitor || false;
        return (
          <div className="flex items-center gap-2">
            <span className="font-medium">{name}</span>
            {isVisitor && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <UserCheck className="h-3 w-3" />
                Visitor
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "kid.age",
      id: "age",
      header: "Age",
      cell: ({ row }) => {
        return <span className="text-sm text-muted-foreground">{row.original.kid?.age || "N/A"}</span>;
      },
    },
    {
      accessorKey: "date",
      id: "date",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Date
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const dateStr = row.original.date;
        const day = row.original.day;
        // date is in MM/yyyy format, day is the day of the month
        if (dateStr && day) {
          try {
            const [month, year] = dateStr.split('/');
            if (month && year) {
              const fullDate = `${year}-${month.padStart(2, '0')}-${String(day).padStart(2, '0')}`;
              return moment(fullDate).format('MMM DD, YYYY');
            }
          } catch {
            return dateStr;
          }
        }
        return "N/A";
      },
      sortingFn: (rowA, rowB) => {
        const dateA = rowA.original.date;
        const dayA = rowA.original.day;
        const dateB = rowB.original.date;
        const dayB = rowB.original.day;
        
        if (!dateA || !dayA) return 1;
        if (!dateB || !dayB) return -1;
        
        const [monthA, yearA] = dateA.split('/');
        const [monthB, yearB] = dateB.split('/');
        
        if (!monthA || !yearA || !monthB || !yearB) return 0;
        
        const fullDateA = `${yearA}-${monthA.padStart(2, '0')}-${String(dayA).padStart(2, '0')}`;
        const fullDateB = `${yearB}-${monthB.padStart(2, '0')}-${String(dayB).padStart(2, '0')}`;
        
        return fullDateA.localeCompare(fullDateB);
      },
    },
    {
      accessorKey: "checkInTime",
      id: "checkInTime",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="-ml-4"
          >
            Check-in Time
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        );
      },
      cell: ({ row }) => {
        const checkInTime = row.original.checkInTime;
        if (!checkInTime) return <span className="text-sm text-muted-foreground">N/A</span>;
        return <span className="text-sm">{moment(checkInTime).format('h:mm A')}</span>;
      },
    },
    {
      accessorKey: "kid.guardian_name",
      id: "guardian",
      header: "Guardian",
      cell: ({ row }) => {
        return <span className="text-sm">{row.original.kid?.guardian_name || "N/A"}</span>;
      },
    },
    {
      accessorKey: "kid.contact",
      id: "contact",
      header: "Contact",
      cell: ({ row }) => {
        const contact = row.original.kid?.contact;
        return contact ? (
          <a href={`tel:${contact}`} className="text-sm text-blue-600 hover:underline dark:text-blue-400">
            {contact}
          </a>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "kid.address",
      id: "address",
      header: "Address",
      cell: ({ row }) => {
        const address = row.original.kid?.address;
        return address ? (
          <span className="text-sm max-w-[200px] truncate block" title={address}>
            {address}
          </span>
        ) : (
          <span className="text-sm text-muted-foreground">N/A</span>
        );
      },
    },
    {
      accessorKey: "present",
      id: "status",
      header: "Status",
      cell: ({ row }) => {
        const present = row.original.present;
        return (
          <div className="flex items-center gap-2">
            {present ? (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                <CheckCircle2 className="h-3 w-3" />
                Present
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                <XCircle className="h-3 w-3" />
                Absent
              </span>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={attendanceList}
      searchKey="name"
      searchPlaceholder="Search by name..."
    />
  );
};

export default AttendanceTable;
