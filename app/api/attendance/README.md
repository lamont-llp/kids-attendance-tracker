# Attendance API Documentation

## Endpoints

### GET /api/attendance
Fetch attendance records for a month and age group.
- Query params: `month` (YYYY-MM), `ageGroup` (optional)
- Response: `{ data: AttendanceRecord[] }`

### POST /api/attendance
Mark attendance for a kid.
- Body: `{ kidId, date, day, present }`
- Response: `{ data: AttendanceRecord }`

### PATCH /api/attendance
Update attendance record.
- Body: `{ kidId, date, day, present }`
- Response: `{ data: UpdateResult }`

### DELETE /api/attendance
Delete attendance record.
- Query params: `kidId`, `date`, `day`
- Response: `{ data: DeleteResult }`

### GET /api/attendance/daily
Fetch daily attendance records.
- Query params: `date` (YYYY-MM-DD), `ageGroup` (optional), `search` (optional)
- Response: `{ data: AttendanceRecord[] }`

### GET /api/attendance/dateRange
Fetch attendance records for a date range.
- Query params: `startDate`, `endDate` (YYYY-MM-DD), `ageGroup` (optional)
- Response: `{ data: AttendanceRecord[] }`

### GET /api/attendance/stats
Fetch attendance statistics for a month and age group.
- Query params: `month` (YYYY-MM), `ageGroup` (optional)
- Response: `{ data: Stats }`

## Response Structure
All successful responses are wrapped in `{ data: ... }`.
All errors are wrapped in `{ error: 'message', details?: string }`.

## Date Format
All endpoints use ISO 8601 format: `YYYY-MM-DD`.

## Age Group Filtering
Age group filtering is standardized across all endpoints.

## Error Handling
Errors return structured messages and do not expose sensitive details.

---
For more details, see the source files in `app/api/attendance/`.
