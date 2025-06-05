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

  const daysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const numberOfDays = daysInMonth(
    moment(selectedMonth).format("yyyy"),
    moment(selectedMonth).format("MM")
  );
  console.log(numberOfDays);
  const daysArrays = Array.from({ length: numberOfDays }, (_, i) => i + 1);
  console.log(daysArrays);

  useEffect(() => {
    if (attendanceList) {
      const userList = getUniqueRecord(attendanceList);
      console.log(userList);
      setRowData(userList);

      daysArrays.forEach((date) => {
        setColDefs((prevData) => [
          ...prevData,
          {
            field: date.toString(),
            width: 50,
            editable: true,
          },
        ]);

        userList.forEach((obj) => {
          obj[date] = isPresent(obj.kidId, date);
        });
      });
    }
  }, [attendanceList]);

  /**
   * Used to check if user is present or not
   * @param kidId
   * @param day
   * @returns {boolean}
   */
  const isPresent = (kidId, day) => {
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
      {rowData && rowData.length > 0 ? (
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
      ) : (
        <div className="text-destructive">No attendance data available</div>
      )}
    </div>
  );
}

export default AttendanceGrid;
