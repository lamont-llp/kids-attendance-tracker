# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2024-12-19-daily-attendance-view/spec.md

## Endpoints

### GET /api/attendance/daily

**Purpose:** Fetch daily attendance records for a specific date with related kid and guardian information
**Parameters:** 
- `date` (required): Date in DD/MM/YYYY format
- `ageGroup` (optional): Filter by age group (2-5yrs, 6-9yrs, 10-13yrs)
- `search` (optional): Search term for kid name or guardian name

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "kidId": 123,
      "present": true,
      "day": 19,
      "date": "19/12/2024",
      "checkInTime": "2024-12-19T09:30:00Z",
      "kid": {
        "id": 123,
        "name": "John Smith",
        "age": "8",
        "contact": "555-0123",
        "guardian": {
          "id": 456,
          "name": "Sarah Smith",
          "contact": "555-0123"
        }
      }
    }
  ],
  "total": 25,
  "filtered": 25
}
```

**Errors:**
- `400 Bad Request`: Invalid date format or missing required parameters
- `404 Not Found`: No attendance records found for the specified date
- `500 Internal Server Error`: Database or server error

### Implementation Details

**Controller:** Create new controller in `app/api/attendance/daily/route.ts`
**Database Query:** Join attendance, kids, and guardians tables with date filtering
**Caching:** Consider implementing response caching for frequently accessed dates
**Pagination:** Support pagination for large datasets (optional for initial implementation) 