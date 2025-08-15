import React from 'react';
import moment from 'moment';

interface DailyAttendanceListProps {
  attendanceList: any[];
  selectedDate: moment.Moment;
}

const DailyAttendanceList = ({ attendanceList, selectedDate }: DailyAttendanceListProps) => {
  return (
    <div className="bg-card/80 backdrop-blur-sm dark:bg-card/90 rounded-xl border border-border/50 shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-3 h-6 bg-gradient-to-b from-primary to-info rounded-full"></div>
          <h3 className="text-xl font-semibold text-foreground">
            Daily Check-ins - {moment(selectedDate).format('MMMM D, YYYY')}
          </h3>
        </div>
        <span className="text-sm text-muted-foreground">Total: {attendanceList.length}</span>
      </div>

      <div className="overflow-auto max-h-[400px]">
        <table className="w-full">
          <thead className="border-b border-border/50">
            <tr>
              <th className="text-left p-3">Name</th>
              <th className="text-left p-3">Check-in Time</th>
              <th className="text-left p-3">Status</th>
            </tr>
          </thead>
          <tbody>
            {attendanceList.map((attendance, index) => (
              <tr key={index} className="border-b border-border/50 hover:bg-muted/50">
                <td className="p-3">{attendance.kidName}</td>
                <td className="p-3">{moment(attendance.checkInTime).format('hh:mm a')}</td>
                <td className="p-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs 
                                        ${
                                          attendance.status === 'Present'
                                            ? 'bg-success/20 text-success'
                                            : 'bg-warning/20 text-warning'
                                        }`}
                  >
                    {attendance.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DailyAttendanceList;
