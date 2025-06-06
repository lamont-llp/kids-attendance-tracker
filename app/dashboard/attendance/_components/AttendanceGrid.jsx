import React, { useEffect, useState, useMemo } from "react";
import { AgGridReact } from "ag-grid-react";
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import moment from "moment";
import GlobalApi from "../../../services/GlobalApi";
import { toast } from "sonner";
import { getUniqueRecord } from "../../../services/service";

ModuleRegistry.registerModules([AllCommunityModule]);

function AttendanceGrid({ attendanceList, selectedMonth }) {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([
    { field: "kidId", filter: true },
    { field: "name", filter: true },
  ]);
  const [isLoading, setIsLoading] = useState(true);

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
    
    const monthMoment = moment(selectedMonth);
    const year = monthMoment.year();
    const month = monthMoment.month(); // 0-indexed month
    
    return getSundaysInMonth(year, month);
  }, [selectedMonth]);

  useEffect(() => {
    setIsLoading(true);

    // Create column definitions for Sundays
    if (selectedMonth) {
      const newColDefs = [
        { field: "kidId", filter: true },
        { field: "name", filter: true },
        ...sundays.map(day => ({
          field: day.toString(),
          width: 50,
          editable: true,
          headerName: moment(selectedMonth).date(day).format("ddd D"), // Optional: Format header as "Sun 1"
        })),
      ];
      setColDefs(newColDefs);
    }

    // Process attendance data
    if (attendanceList?.length > 0) {
      const userList = getUniqueRecord({ attendanceList });
      const updatedUserList = userList.map(obj => {
        const newObj = { ...obj };
        sundays.forEach(day => {
          newObj[day] = isPresent(obj.kidId, day);
        });
        return newObj;
      });
      setRowData(updatedUserList);
      setIsLoading(false);
    } else {
      // Fetch kids to show empty grid
      GlobalApi.GetAllKids()
        .then(response => {
          if (response.data?.length > 0) {
            const emptyAttendance = response.data.map(kid => {
              const record = { kidId: kid.id, name: kid.name };
              sundays.forEach(day => (record[day] = false));
              return record;
            });
            setRowData(emptyAttendance);
          }
        })
        .catch(error => {
          console.error("Error fetching kids:", error);
          setRowData([]);
        })
        .finally(() => setIsLoading(false));
    }
  }, [attendanceList, selectedMonth, sundays]);

  // Check if kid was present on a specific Sunday
  const isPresent = (kidId: string, day: number) => {
    return attendanceList?.some(
      item => item.day === day && item.kidId === kidId
    ) || false;
  };

  // Mark attendance handler (remains unchanged)
  const onMarkAttendance = (day, kidId, presentStatus) => {
    // ... existing implementation ...
  };

  return (
    <div>
      {isLoading ? (
        <div>Loading attendance data...</div>
      ) : (
        <div style={{ height: 500 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            onCellValueChanged={e => 
              onMarkAttendance(e.colDef.field, e.data.kidId, e.newValue)
            }
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={true}
          />
        </div>
      )}
    </div>
  );
}

export default AttendanceGrid;
