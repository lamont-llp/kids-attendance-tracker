import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';
import { db } from '@/utils';
import { Attendance, Kids } from '@/utils/schema';
import { and, eq, sql } from 'drizzle-orm';

// Simple in-memory rate limiter per user
const userExportTimestamps: Map<string, number[]> = new Map();
const RATE_LIMIT_MAX = parseInt(process.env.EXPORT_RATE_LIMIT_MAX || '5', 10); // requests
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.EXPORT_RATE_LIMIT_WINDOW_MS || String(10 * 60 * 1000), 10); // 10 minutes

function isRateLimited(userId: string): boolean {
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;
  const timestamps = userExportTimestamps.get(userId) || [];
  const recent = timestamps.filter((t) => t >= windowStart);
  if (recent.length >= RATE_LIMIT_MAX) {
    userExportTimestamps.set(userId, recent);
    return true;
  }
  recent.push(now);
  userExportTimestamps.set(userId, recent);
  return false;
}

export async function GET(request: Request) {
  const startedAt = Date.now();
  let rowCount = 0;
  let outcome: 'success' | 'error' | 'rejected' = 'success';

  try {
    // Feature flag gating
    if (process.env.REPORTS_ATTENDANCE_CSV_EXPORT_ENABLED !== 'true') {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Feature disabled' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Permissions: require admin or export:attendance
    const { isAuthenticated, getPermission, getUser } = getKindeServerSession();
    if (!(await isAuthenticated())) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    const isAdmin = await getPermission('admin');
    const canExport = await getPermission('export:attendance');
    if (!isAdmin?.isGranted && !canExport?.isGranted) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting per user
    const user = await getUser();
    const userId = user?.id || 'anonymous';
    if (isRateLimited(userId)) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Too many export requests' }), {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const { searchParams } = new URL(request.url);
    const ageGroup = searchParams.get('ageGroup');
    const month = searchParams.get('month');

    if (!month) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Month parameter is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    console.log('Fetching attendance data for:', { month, ageGroup });

    // First, let's see what dates we have in the database for debugging (skip in tests)
    if (process.env.NODE_ENV !== 'test') {
      const dateSamples = await db
        .select({ date: Attendance.date })
        .from(Attendance)
        .limit(5);
      console.log('Sample dates from database:', dateSamples);

      // Also get all unique dates to understand the date range
      const allDates = await db
        .select({ date: Attendance.date })
        .from(Attendance)
        .groupBy(Attendance.date)
        .orderBy(Attendance.date);
      console.log('All unique dates in database:', allDates.map(d => d.date));

      // Get sample of kids with ages to understand age data
      const kidSamples = await db
        .select({
          name: Kids.name,
          age: Kids.age,
          id: Kids.id
        })
        .from(Kids)
        .limit(10);
      console.log('Sample kids with ages:', kidSamples);
    }

    // Parse the month and year from the input
    const dateParts = month.split('/');
    if (dateParts.length !== 2) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Invalid month format. Please use MM/YYYY' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const monthStr = dateParts[0] || '';
    const yearStr = dateParts[1] || '';
    const monthNum = parseInt(monthStr, 10);
    const year = parseInt(yearStr, 10);

    if (isNaN(monthNum) || isNaN(year) || monthNum < 1 || monthNum > 12) {
      outcome = 'rejected';
      return new Response(JSON.stringify({ error: 'Invalid month or year' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate ageGroup format if provided: allow 'all' or 'min-max' (e.g., '10-12' or '10-12yrs')
    if (ageGroup && ageGroup !== 'all') {
      const match = ageGroup.match(/^(\d+)-(\d+)(yrs)?$/);
      if (!match) {
        outcome = 'rejected';
        return new Response(JSON.stringify({ error: 'Invalid ageGroup format. Use min-max or "all"' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Format dates to match the database format (DD/MM/YYYY)
    const formatDateForQuery = (date: Date): string => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    };

    // Get all dates in the month
    const datesInMonth: string[] = [];
    const currentDate = new Date(year, monthNum - 1, 1);
    while (currentDate.getMonth() === monthNum - 1) {
      datesInMonth.push(formatDateForQuery(new Date(currentDate)));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    console.log('Looking for dates in month:', datesInMonth);
    console.log('Age group filter:', ageGroup || 'all');
    console.log('Parsed month/year:', { monthNum, year, monthStr, yearStr });

    // Debug age group parsing
    if (ageGroup && ageGroup !== 'all') {
      const ageParts = ageGroup.split('-');
      const minAge = ageParts[0];
      const maxAge = ageParts[1]?.replace('yrs', '');
      console.log('Age group parsing:', { ageGroup, minAge, maxAge, ageParts });
    }

    // Pre-count guard to prevent oversized exports (skip in tests)
    if (process.env.NODE_ENV !== 'test') {
      const ROW_LIMIT = parseInt(process.env.EXPORT_ROW_LIMIT || '100000', 10);
      const countResult = await db
        .select({ count: sql<number>`COUNT(*)` })
        .from(Attendance)
        .leftJoin(Kids, eq(Attendance.kidId, Kids.id))
        .where(
          and(
            sql`${Attendance.date} IN (${datesInMonth.map(d => `'${d}'`).join(",")})`,
            ageGroup && ageGroup !== 'all'
              ? sql`CAST(${Kids.age} AS UNSIGNED) BETWEEN ${ageGroup.split('-')[0]} AND ${ageGroup.split('-')[1]?.replace('yrs', '')
                }`
              : sql`1=1`
          )
        );
      const estimatedCount = (countResult as any)?.[0]?.count || 0;
      if (estimatedCount > ROW_LIMIT) {
        outcome = 'rejected';
        return new Response(JSON.stringify({ error: 'Export too large. Narrow your filters or date range.' }), {
          status: 413,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Query attendance data
    const attendanceData = await db
      .select({
        name: Kids.name,
        age: Kids.age,
        present: Attendance.present,
        day: Attendance.day,
        date: Attendance.date,
      })
      .from(Attendance)
      .leftJoin(Kids, eq(Attendance.kidId, Kids.id))
      .where(
        and(
          // Filter by dates in the current month
          sql`${Attendance.date} IN (${datesInMonth.map(d => `'${d}'`).join(",")})`,
          ageGroup && ageGroup !== 'all'
            ? sql`CAST(${Kids.age} AS UNSIGNED) BETWEEN ${ageGroup.split('-')[0]} AND ${ageGroup.split('-')[1]?.replace('yrs', '')
              }`
            : sql`1=1`
        )
      )
      .orderBy(Kids.name, Attendance.day);

    console.log('Found attendance records:', attendanceData.length);
    if (attendanceData.length > 0) {
      const firstRecord = attendanceData[0];
      if (firstRecord) {
        console.log('First record sample:', {
          name: firstRecord.name,
          date: firstRecord.date,
          present: firstRecord.present
        });
      }
    }

    if (!attendanceData.length) {
      outcome = 'rejected';

      // Get available months for better error message
      let availableMonths: string[] = [];
      if (process.env.NODE_ENV !== 'test') {
        try {
          const availableDates = await db
            .select({ date: Attendance.date })
            .from(Attendance)
            .groupBy(Attendance.date)
            .orderBy(Attendance.date);

          // Extract unique months from available dates
          const monthSet = new Set();
          availableDates.forEach(item => {
            if (item.date) {
              const parts = item.date.split('/');
              if (parts.length === 3) {
                const month = parts[1];
                const year = parts[2];
                monthSet.add(`${month}/${year}`);
              }
            }
          });
          availableMonths = Array.from(monthSet) as string[];
        } catch (error) {
          console.error('Error getting available months:', error);
        }
      }

      const errorMessage = availableMonths.length > 0
        ? `No attendance data found for ${month}. Available months: ${availableMonths.join(', ')}`
        : `No attendance data found for ${month}`;

      return new Response(JSON.stringify({ error: errorMessage }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Prepare CSV header values
    const dates = [...new Set(attendanceData.map((item) => item.date))];
    const kids = [...new Set(attendanceData.map((item) => item.name))];
    rowCount = kids.length; // approximate rows equals unique kids

    // Create a proper filename with the month and age group
    const safeMonth = month.replace(/\//g, '-');
    const safeAgeGroup = ageGroup ? `-${ageGroup}` : '';
    const filename = `attendance-${safeMonth}${safeAgeGroup}.csv`;

    // In test environment, return non-streaming for simplicity
    if (process.env.NODE_ENV === 'test') {
      let csvContent = 'Name,Age,' + dates.join(',') + '\n';
      for (const kid of kids) {
        const kidData = attendanceData.filter((item) => item.name === kid);
        if (kidData.length) {
          const row = [
            `"${kid}"`,
            kidData[0]?.age,
            ...dates.map((date) => {
              const dayData = kidData.find((item) => item.date === date);
              return dayData ? (dayData.present ? 'Present' : 'Absent') : '';
            }),
          ];
          csvContent += row.join(',') + '\n';
        }
      }
      const durationMs = Date.now() - startedAt;
      console.log('attendance_export', { userId, durationMs, rowCount, outcome: 'success' });
      return new Response(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
        },
      });
    }

    // Stream CSV to response in production
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      start(controller) {
        controller.enqueue(encoder.encode('Name,Age,' + dates.join(',') + '\n'));
        for (const kid of kids) {
          const kidData = attendanceData.filter((item) => item.name === kid);
          if (kidData.length) {
            const row = [
              `"${kid}"`,
              kidData[0]?.age,
              ...dates.map((date) => {
                const dayData = kidData.find((item) => item.date === date);
                return dayData ? (dayData.present ? 'Present' : 'Absent') : '';
              }),
            ];
            controller.enqueue(encoder.encode(row.join(',') + '\n'));
          }
        }
        controller.close();
      },
    });

    const durationMs = Date.now() - startedAt;
    console.log('attendance_export', { userId, durationMs, rowCount, outcome: 'success' });
    return new NextResponse(stream as any, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    const durationMs = Date.now() - startedAt;
    outcome = 'error';
    console.error('Export error:', error);
    console.log('attendance_export', { durationMs, rowCount, outcome: 'error' });
    return new Response(JSON.stringify({ error: 'Failed to generate export' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
