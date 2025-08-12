// Define the attendance record type
interface AttendanceRecord {
  kidId: string | number;
  [key: string]: any; // Allow for additional properties
}

interface GetUniqueRecordParams {
  attendanceList: AttendanceRecord[];
}

/**
 * Used to get Distinct user list
 * @param params - Object containing attendanceList
 * @returns Array of unique attendance records
 */
export const getUniqueRecord = ({ attendanceList }: GetUniqueRecordParams): AttendanceRecord[] => {
  console.log(
    'getUniqueRecord - received:',
    attendanceList,
    'Type:',
    typeof attendanceList,
    'IsArray:',
    Array.isArray(attendanceList),
  );

  const uniqueRecord: AttendanceRecord[] = [];
  const existingUser = new Set<string | number>();

  // Ensure we have an array
  if (!Array.isArray(attendanceList)) {
    console.error('getUniqueRecord: attendanceList is not an array', attendanceList);
    return uniqueRecord;
  }

  attendanceList?.forEach((record: AttendanceRecord) => {
    if (!existingUser.has(record.kidId)) {
      existingUser.add(record.kidId);
      uniqueRecord.push(record);
    }
  });

  return uniqueRecord;
};

// Alternative safer version
export const getUniqueRecordSafe = (attendanceList?: AttendanceRecord[]): AttendanceRecord[] => {
  console.log('=== getUniqueRecordSafe DEBUG ===');
  console.log('Received:', attendanceList);
  console.log('Type:', typeof attendanceList);
  console.log('IsArray:', Array.isArray(attendanceList));

  // Early return for invalid input
  if (!attendanceList || !Array.isArray(attendanceList) || attendanceList.length === 0) {
    console.log('Returning empty array due to invalid input');
    return [];
  }

  const uniqueRecord: AttendanceRecord[] = [];
  const existingUser = new Set<string | number>();

  attendanceList.forEach((record) => {
    if (record?.kidId !== undefined && record?.kidId !== null && !existingUser.has(record.kidId)) {
      existingUser.add(record.kidId);
      uniqueRecord.push(record);
    }
  });

  console.log('Returning unique records:', uniqueRecord);
  return uniqueRecord;
};
