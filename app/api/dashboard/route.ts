import { db } from '../../../utils';
import { Attendance, Kids } from '../../../utils/schema';
import { and, desc, eq, sql, between } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

/**
 * Gets the age range for a given age group
 * @param ageGroup The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 * @returns An object with min and max age values
 */
function getAgeRangeFromGroup(ageGroup: string): { min: number; max: number } {
  switch (ageGroup) {
    case 'all':
      return { min: 2, max: 13 };
    case '2-5yrs':
      return { min: 2, max: 5 };
    case '6-9yrs':
      return { min: 6, max: 9 };
    case '10-13yrs':
      return { min: 10, max: 13 };
    default:
      return { min: 0, max: 0 }; // Default case, should not happen
  }
}

export async function GET(req: NextRequest) {
  const searchParams = req.nextUrl.searchParams;
  const date = searchParams.get('date');
  const ageGroup = searchParams.get('ageGroup');

  // Get the age range for the selected age group if provided
  const ageRange = ageGroup ? getAgeRangeFromGroup(ageGroup) : null;

  const result = await db
    .select({
      day: Attendance.day,
      presentCount: sql`count(${Attendance.day})`,
    })
    .from(Attendance)
    .leftJoin(
      Kids,
      and(eq(Attendance.kidId, Kids.id), date ? eq(Attendance.date, date) : undefined),
    )
    .where(
      ageGroup
        ? // Filter by age range instead of exact age group match
          between(
            // Convert string age to number for comparison
            sql`CAST(${Kids.age} AS UNSIGNED)`,
            ageRange!.min,
            ageRange!.max,
          )
        : undefined,
    )
    .groupBy(Attendance.day)
    .orderBy(desc(Attendance.day))
    .limit(7);

  return NextResponse.json(result);
}
