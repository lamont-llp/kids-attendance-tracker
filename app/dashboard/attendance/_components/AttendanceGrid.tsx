import React, { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  ColDef,
  CellValueChangedEvent,
} from "ag-grid-community";
import moment from "moment";
import GlobalApi from "../../../services/GlobalApi";
import { toast } from "sonner";
import { getUniqueRecord } from "../../../services/service";

ModuleRegistry.registerModules([AllCommunityModule]);

interface AttendanceItem {
  kidId: number;
  day: number;
  name?: string;
  [key: string]: any;
}

interface AttendanceGridProps {
  attendanceList?: AttendanceItem[];
  selectedMonth?: string;
}

interface RowData {
  kidId: number;
  name: string;
  [key: number]: boolean;
}

function AttendanceGrid({
  attendanceList,
  selectedMonth,
}: AttendanceGridProps) {
  const [rowData, setRowData] = useState<RowData[]>([]);
  const [colDefs, setColDefs] = useState<ColDef[]>([
    {
      field: "kidId",
      filter: true,
      minWidth: 150,
      flex: 1, // Takes available space
      resizable: true,
    },
    { field: "name", filter: true },
  ]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper function to get Sundays in a month
  const getSundaysInMonth = (year: number, month: number): number[] => {
    const sundays: number[] = [];
    const date = new Date(year, month, 1);

    // Find first Sunday
    while (date.getDay() !== 0) {
      date.setDate(date.getDate() + 1);
    }

    // Collect all Sundays in the month
    while (date.getMonth() === month) {
      sundays.push(date.getDate());
      date.setDate(date.getDate() + 7);
    }

    return sundays;
  };

  // Get Sundays for the selected month
  const sundays = useMemo(() => {
    if (!selectedMonth) return [];

    // Ensure proper date format for moment
    const monthMoment = moment(selectedMonth, "MM/YYYY");
    if (!monthMoment.isValid()) {
      console.error("Invalid date format:", selectedMonth);
      return [];
    }

    const year = monthMoment.year();
    const month = monthMoment.month(); // 0-indexed month

    return getSundaysInMonth(year, month);
  }, [selectedMonth]);

  useEffect(() => {
    setIsLoading(true);

    // Create column definitions for Sundays
    if (selectedMonth) {
      const newColDefs: ColDef[] = [
        { field: "kidId", filter: true },
        { field: "name", filter: true },
        ...sundays.map((day) => ({
          field: day.toString(),
          width: 100,
          maxWidth: 120,
          hide: window.innerWidth < 768, // Hide on mobile
          editable: true,
          headerName: moment(selectedMonth).date(day).format("ddd D"), // Optional: Format header as "Sun 1"
        })),
      ];
      setColDefs(newColDefs);
    }

    // Process attendance data
    if (attendanceList && attendanceList.length > 0) {
      const userList = getUniqueRecord({ attendanceList });
      const updatedUserList = userList.map((obj: any) => {
        const newObj: RowData = { ...obj };
        sundays.forEach((day) => {
          newObj[day] = isPresent(obj.kidId, day);
        });
        return newObj;
      });
      setRowData(updatedUserList);
      setIsLoading(false);
    } else {
      // Fetch kids to show empty grid
      GlobalApi.GetAllKids()
        .then((response) => {
          if (response.data?.length > 0) {
            const emptyAttendance = response.data.map((kid: any) => {
              const record: RowData = { kidId: kid.id, name: kid.name };
              sundays.forEach((day) => (record[day] = false));
              return record;
            });
            setRowData(emptyAttendance);
          }
        })
        .catch((error) => {
          console.error("Error fetching kids:", error);
          setRowData([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [attendanceList, selectedMonth, sundays]);

  // Check if kid was present on a specific Sunday
  const isPresent = (kidId: number, day: number): boolean => {
    return (
      attendanceList?.some(
        (item) => item.day === day && item.kidId === kidId
      ) || false
    );
  };

  // Mark attendance handler
  const onMarkAttendance = (
    day: string,
    kidId: number,
    presentStatus: boolean
  ): void => {
    if (!selectedMonth) return;

    const date = moment(selectedMonth).format("MM/yyyy");
    if (presentStatus) {
      const data = {
        day: day,
        kidId: kidId,
        present: presentStatus,
        date: date,
      };

      GlobalApi.MarkAttendance(data).then((response) => {
        console.log("Mark attendance", response);
        toast("Kid Id: " + kidId + " Marked as present");
      });
    } else {
      GlobalApi.MarkAbsent(kidId, day, date).then((response) => {
        toast("Kid Id: " + kidId + " Marked as absent");
      });
    }
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading attendance data...</div>
      ) : (
        <div
          style={{
            height: "calc(100vh - 200px)", // Adjust based on your layout
            minHeight: "400px",
            maxHeight: "800px",
          }}
        >
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            onCellValueChanged={(e: CellValueChangedEvent) =>
              onMarkAttendance(
                e.colDef.field as string,
                e.data.kidId,
                e.newValue
              )
            }
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={true}
            // Responsive features
            suppressHorizontalScroll={false}
            suppressColumnVirtualisation={true}
            autoSizeStrategy={{
              type: "fitGridWidth",
              defaultMinWidth: 100,
            }}
            onGridReady={(params) => {
              params.api.sizeColumnsToFit();
            }}
            onGridSizeChanged={(params) => {
              params.api.sizeColumnsToFit();
            }}
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceGrid;
