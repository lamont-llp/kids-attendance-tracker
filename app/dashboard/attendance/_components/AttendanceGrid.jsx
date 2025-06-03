import React, {useEffect, useState} from 'react'
import { AgGridReact } from 'ag-grid-react'; // React Data Grid Component
import { AllCommunityModule, ModuleRegistry } from 'ag-grid-community';
import moment from "moment";

// Register all Community features
ModuleRegistry.registerModules([AllCommunityModule]);

function AttendanceGrid({attendanceList}, selectedMonth) {

    const [rowData, setRowData] = useState([])
    const [colDefs, setColDefs] = useState([
    { field: 'kidId'},
    { field: 'name'},
    ])

    const daysInMonth = (year, month) => new Date(year, month+1, 0).getDate();
    const numberOfDays = daysInMonth(moment(selectedMonth).format('yyyy'),moment(selectedMonth).format('MM'));
    console.log(numberOfDays);
    const daysArrays = Array.from({length: numberOfDays},(_,i) =>i+1)
    console.log(daysArrays);

    useEffect(() => {
        if (attendanceList) {
            const userList = getUniqueRecord();
            console.log(userList);
            setRowData(userList)

            daysArrays.forEach((date) => {
                setColDefs(prevData => [...prevData, {
                    field: date.toString(),width:50, editable:true
                }])

                userList.forEach(obj => {
                    obj[date] = isPresent(obj.kidId, date);
                })
            })
        }
    }, [attendanceList]);

    const isPresent = (kidId, day) => {
        const result = attendanceList.find(item => item.day == day && item.kidId  == kidId)
        return result?true:false
    }

    /**
     * Used to get Distinct user list
     * @returns {*[]}
     */
    const getUniqueRecord = () => {
      const uniqueRecord = [];
      const existingUser = new Set();

      attendanceList?.forEach(record => {
          if (!existingUser.has(record.kidId)) {
              existingUser.add(record.kidId);
              uniqueRecord.push(record);
          }
      })

        return uniqueRecord;
    }


    return (
        <div>
            <h3>Attendance Grid</h3>
            {rowData && rowData.length > 0 ? (
                <div style={{ height: 500 }}>
                    <AgGridReact
                        rowData={rowData}
                        columnDefs={colDefs}
                    />
                </div>
            ) : (
                <div>No attendance data available</div>
            )}
        </div>

    )
}

export default AttendanceGrid
