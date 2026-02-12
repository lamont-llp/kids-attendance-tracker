import { db } from '@/utils';
import { Attendance, Kids, Guardians } from '@/utils/schema';
import { and, eq, or, isNull, between, sql, like, SQL } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Validates date format DD/MM/YYYY
 * @param date The date string to validate
 * @returns true if valid, false otherwise
 */
function isValidDateFormat(date: string): boolean {
  // ISO 8601 format: YYYY-MM-DD
  const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
  if (!dateRegex.test(date)) return false;
  const dateObj = new Date(date);
  return !isNaN(dateObj.getTime());
}

/**
 * Gets the age range for a given age group
 * @param ageGroup The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 * @returns An object with min and max age values
 */
{
  /*function getAgeRangeFromGroup(ageGroup: string): { min: number, max: number } {
    switch (ageGroup) {
        case "2-5yrs":
            return { min: 2, max: 5 };
        case "6-9yrs":
            return { min: 6, max: 9 };
        case "10-13yrs":
            return { min: 10, max: 13 };
        default:
            return { min: 0, max: 0 }; // Default case, should not happen
    }
}*/
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const ageGroup = searchParams.get('ageGroup');
    const search = searchParams.get('search');

    console.log('Daily Attendance API received:', { date, ageGroup, search });

    // Validate required date parameter
    if (!date) {
      return NextResponse.json({ error: 'Missing required date parameter' }, { status: 400 });
    }

    // Validate date format
    if (!isValidDateFormat(date)) {
      return NextResponse.json({ error: 'Invalid date format. Use YYYY-MM-DD (ISO 8601)' }, { status: 400 });
    }

    // Build the base query - start with Kids table and join with Attendance
    const query = db
      .select({
        id: Attendance.id,
        kidId: Attendance.kidId,
        present: Attendance.present,
        day: Attendance.day,
        date: Attendance.date,
        kid: {
          id: Kids.id,
          name: Kids.name,
          age: Kids.age,
          contact: Kids.contact,
          guardian_id: Kids.guardian_id,
        },
        guardian: {
          id: Guardians.id,
          name: Guardians.name,
          contact: Guardians.contact,
        },
      })
      .from(Kids)
      .leftJoin(Attendance, eq(Kids.id, Attendance.kidId))
      .leftJoin(Guardians, eq(Kids.guardian_id, Guardians.id));

    // Build where conditions
    const whereConditions = [eq(Attendance.date, date)];

    // Add age group filter if provided
    if (ageGroup) {
      // Use the same function as other endpoints
      const { min, max } = getAgeRangeFromGroup(ageGroup);
      // Only filter if valid range
      if (min > 0 || max > 0) {
        whereConditions.push(
          between(
            sql`CAST(${Kids.age} AS UNSIGNED)`,
            min,
            max
          )
        );
      }
    }

    // Add search filter if provided
    if (search?.trim()) {
      const trimmed = search.trim();
      const filterCondition = or(
        like(Kids.name, `%${trimmed}%`),
        like(Guardians.name, `%${trimmed}%`),
      );
      whereConditions.push(filterCondition as SQL<unknown>);
    }

    // Execute the query with where conditions
    const result = await query.where(and(...whereConditions));

    console.log('Daily Attendance Database result:', result);

    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('Daily Attendance API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch daily attendance records', details: typeof error === 'string' ? error : undefined },
      { status: 500 },
    );
  }
}
