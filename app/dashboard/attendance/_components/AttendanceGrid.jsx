import React, { useEffect, useState } from "react";
import { AgGridReact } from "ag-grid-react"; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import moment from "moment";
import GlobalApi from "../../../services/GlobalApi";
import { toast } from "sonner";
import { getUniqueRecord } from "../../../services/service";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

function AttendanceGrid({ attendanceList, selectedMonth }) {
  const [rowData, setRowData] = useState([]);
  const [colDefs, setColDefs] = useState([
    { field: "kidId", filter: true },
    { field: "name", filter: true },
  ]);
  const [isLoading, setIsLoading] = useState(true);

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const numberOfDays = selectedMonth
    ? daysInMonth(
        moment(selectedMonth).format("yyyy"),
        moment(selectedMonth).format("MM") - 1
      )
    : 0;

  const daysArrays = Array.from({ length: numberOfDays }, (_, i) => i + 1);

  useEffect(() => {
    setIsLoading(true);

    // Create column definitions regardless of attendance data
    if (selectedMonth) {
      const newColDefs = [
        { field: "kidId", filter: true },
        { field: "name", filter: true },
        ...daysArrays.map((date) => ({
          field: date.toString(),
          width: 50,
          editable: true,
        })),
      ];
      setColDefs(newColDefs);
    }

    // Process attendance data if available
    if (
      attendanceList &&
      Array.isArray(attendanceList) &&
      attendanceList.length > 0
    ) {
      const userList = getUniqueRecord({ attendanceList });

      // Update user attendance data
      const updatedUserList = userList.map((obj) => {
        const newObj = { ...obj };
        daysArrays.forEach((date) => {
          newObj[date] = isPresent(obj.kidId, date);
        });
        return newObj;
      });
      setRowData(updatedUserList);
    } else {
      // If no attendance data, fetch all kids to show empty grid
      GlobalApi.GetAllKids()
        .then((response) => {
          if (response.data && Array.isArray(response.data)) {
            // Create empty attendance records for all kids
            const emptyAttendance = response.data.map((kid) => {
              const record = {
                kidId: kid.id,
                name: kid.name,
              };
              // Add empty attendance for each day
              daysArrays.forEach((day) => {
                record[day] = false;
              });
              return record;
            });
            setRowData(emptyAttendance);
          }
        })
        .catch((error) => {
          console.error("Error fetching kids:", error);
          setRowData([]);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }

    setIsLoading(false);
  }, [attendanceList, selectedMonth]);

  /**
   * Used to check if user is present or not
   * @param kidId
   * @param day
   * @returns {boolean}
   */
  const isPresent = (kidId, day) => {
    if (!attendanceList || !Array.isArray(attendanceList)) return false;

    const result = attendanceList.find(
      (item) => item.day == day && item.kidId == kidId
    );
    return result ? true : false;
  };

  /**
   * Used to mark kid attendance
   * @param day
   * @param kidId
   * @param presentStatus
   */
  const onMarkAttendance = (day, kidId, presentStatus) => {
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
        <div style={{ height: 500 }}>
          <AgGridReact
            rowData={rowData}
            columnDefs={colDefs}
            onCellValueChanged={(e) =>
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
