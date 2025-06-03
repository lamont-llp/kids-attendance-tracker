/**
 * Used to get Distinct user list
 * @returns {*[]}
 */
export const getUniqueRecord = (attendanceList) => {
    console.log('getUniqueRecord - received:', attendanceList, 'Type:', typeof attendanceList, 'IsArray:', Array.isArray(attendanceList));

    const uniqueRecord = [];
    const existingUser = new Set();

    // Ensure we have an array
    if (!Array.isArray(attendanceList)) {
        console.error('getUniqueRecord: attendanceList is not an array', attendanceList);
        return uniqueRecord;
    }

    attendanceList?.forEach((record) => {
        if (!existingUser.has(record.kidId)) {
            existingUser.add(record.kidId);
            uniqueRecord.push(record);
        }
    })

    return uniqueRecord;
}