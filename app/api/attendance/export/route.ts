import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/utils';
import { Attendance, Kids } from '@/utils/schema';
import { and, between, sql, count } from 'drizzle-orm';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { getAgeRangeFromGroup, isValidAgeGroup } from '@/utils/ageGroupUtils';
import { parseISO, isValid, differenceInDays, format } from 'date-fns';
import { checkExportRateLimit } from '@/lib/rateLimiter';

/**
 * Server-side CSV export endpoint with streaming support
 * 
 * POST /api/attendance/export
 * 
 * Request body:
 * {
 *   startDate: string (YYYY-MM-DD)
 *   endDate: string (YYYY-MM-DD)
 *   ageGroup?: string (2-5yrs | 6-9yrs | 10-13yrs | all)
 *   includeHeaders?: boolean
 * }
 * 
 * Responses:
 * - 200: CSV stream
 * - 400: Invalid parameters
 * - 401: Not authenticated
 * - 413: Dataset too large (>50,000 records)
 * - 500: Server error
 */

const MAX_RECORDS = 50000;
const MAX_DATE_RANGE_DAYS = 90;
const BATCH_SIZE = 1000;

/**
 * Escapes a CSV cell value according to RFC 4180 standard
 */
function escapeCsvCell(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }
  
  const str = String(value);
  
  // Check if cell needs quoting
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  
  return str;
}

/**
 * Formats a timestamp to local time string
 */
function formatCheckInTime(timestamp: Date | string | null): string {
  if (!timestamp) return 'N/A';
  
  try {
    const date = typeof timestamp === 'string' ? new Date(timestamp) : timestamp;
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
  } catch (error) {
    return 'Invalid';
  }
}

export async function POST(req: NextRequest) {
  try {
    // Check authentication
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // Check rate limit
    const rateLimitCheck = checkExportRateLimit(user.id);
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          error: 'Rate limit exceeded. Too many export requests.',
          retryAfter: rateLimitCheck.retryAfter
        },
        { 
          status: 429,
          headers: {
            'Retry-After': String(rateLimitCheck.retryAfter || 60),
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Math.floor(Date.now() / 1000) + (rateLimitCheck.retryAfter || 60))
          }
        }
      );
    }

    // Check if export feature is enabled
    const exportEnabled = process.env.FEATURE_CSV_EXPORT_ENABLED !== 'false';
    if (!exportEnabled) {
      return NextResponse.json(
        { error: 'Export feature is not enabled' },
        { status: 403 }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const { startDate, endDate, ageGroup = 'all', includeHeaders = true } = body;

    // Validate required fields
    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Missing required parameters: startDate and endDate' },
        { status: 400 }
      );
    }

    // Validate date formats
    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = parseISO(endDate);

    if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Validate date range
    if (parsedEndDate < parsedStartDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      );
    }

    const daysDifference = differenceInDays(parsedEndDate, parsedStartDate);
    if (daysDifference > MAX_DATE_RANGE_DAYS) {
      return NextResponse.json(
        { error: `Date range cannot exceed ${MAX_DATE_RANGE_DAYS} days` },
        { status: 400 }
      );
    }

    // Validate age group
    if (!isValidAgeGroup(ageGroup)) {
      return NextResponse.json(
        { error: 'Invalid age group. Must be: 2-5yrs, 6-9yrs, 10-13yrs, or all' },
        { status: 400 }
      );
    }

    // Build where conditions
    const whereConditions = [
      between(Attendance.date, startDate, endDate)
    ];

    // Add age filter if not 'all'
    if (ageGroup !== 'all') {
      const { min, max } = getAgeRangeFromGroup(ageGroup);
      whereConditions.push(
        between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max)
      );
    }

    // Pre-flight count check to prevent memory issues
    const countResult = await db
      .select({ count: count() })
      .from(Attendance)
      .leftJoin(Kids, sql`${Attendance.kidId} = ${Kids.id}`)
      .where(and(...whereConditions));

    const totalRecords = Number(countResult[0]?.count || 0);

    if (totalRecords > MAX_RECORDS) {
      return NextResponse.json(
        { 
          error: `Dataset too large. Maximum ${MAX_RECORDS} records allowed. Found ${totalRecords} records.`,
          totalRecords,
          maxRecords: MAX_RECORDS
        },
        { status: 413 }
      );
    }

    // Log export request
    console.log('Export request:', {
      userId: user.id,
      email: user.email,
      startDate,
      endDate,
      ageGroup,
      totalRecords,
      timestamp: new Date().toISOString()
    });

    // Create streaming CSV response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          // Add UTF-8 BOM for Excel compatibility
          controller.enqueue(encoder.encode('\uFEFF'));

          // CSV Headers
          if (includeHeaders) {
            const headers = ['Date', 'Student Name', 'Age Group', 'Status', 'Check-in Time', 'Visitor'];
            const headerRow = headers.map(h => escapeCsvCell(h)).join(',') + '\n';
            controller.enqueue(encoder.encode(headerRow));
          }

          // Fetch and stream data in batches
          let offset = 0;
          let hasMore = true;

          while (hasMore) {
            const batchRecords = await db
              .select({
                id: Attendance.id,
                kidId: Attendance.kidId,
                present: Attendance.present,
                date: Attendance.date,
                checkInTime: Attendance.checkInTime,
                kid_name: Kids.name,
                kid_age: Kids.age,
                kid_isVisitor: Kids.isVisitor,
              })
              .from(Attendance)
              .leftJoin(Kids, sql`${Attendance.kidId} = ${Kids.id}`)
              .where(and(...whereConditions))
              .orderBy(Attendance.date, Kids.name)
              .limit(BATCH_SIZE)
              .offset(offset);

            if (batchRecords.length === 0) {
              hasMore = false;
              break;
            }

            // Format and stream batch
            for (const record of batchRecords) {
              const row = [
                record.date,
                record.kid_name || '',
                record.kid_age || '',
                record.present ? 'Present' : 'Absent',
                formatCheckInTime(record.checkInTime),
                record.kid_isVisitor ? 'Yes' : 'No'
              ];
              
              const csvRow = row.map(cell => escapeCsvCell(cell)).join(',') + '\n';
              controller.enqueue(encoder.encode(csvRow));
            }

            offset += BATCH_SIZE;
            
            // Check if we've fetched all records
            if (batchRecords.length < BATCH_SIZE) {
              hasMore = false;
            }
          }

          controller.close();
        } catch (error) {
          console.error('Stream error:', error);
          controller.error(error);
        }
      }
    });

    // Generate filename with date range
    const filename = `attendance-export-${startDate}-to-${endDate}.csv`;

    return new NextResponse(stream, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache',
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': String(rateLimitCheck.remaining || 0),
      },
    });

  } catch (error) {
    console.error('Export API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
