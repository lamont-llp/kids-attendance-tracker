import {db} from "@/utils";
import {Attendance, Kids} from "@/utils/schema";
import {and, eq, or, isNull, between, sql} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

/**
 * Gets the age range for a given age group
 * @param ageGroup The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 * @returns An object with min and max age values
 */
function getAgeRangeFromGroup(ageGroup: string): { min: number, max: number } {
    switch(ageGroup) {
        case "2-5yrs":
            return { min: 2, max: 5 };
        case "6-9yrs":
            return { min: 6, max: 9 };
        case "10-13yrs":
            return { min: 10, max: 13 };
        default:
            return { min: 0, max: 0 }; // Default case, should not happen
    }
}

export async function GET( req: NextRequest ){

    try {
        const searchParams = req.nextUrl.searchParams;
        const ageGroup = searchParams.get("ageGroup");
        const month = searchParams.get("month");

        console.log('API received:', { ageGroup, month });

        if (!ageGroup || !month) {
            return NextResponse.json({ error: 'Missing required parameters' });
        }
    // Get the age range for the selected age group
    const { min, max } = getAgeRangeFromGroup(ageGroup);

    const result = await db.select({
        name: Kids.name,
        present: Attendance.present,
        day: Attendance.day,
        date: Attendance.date,
        age: Kids.age, // Now storing actual age
        kidId: Kids.id,
        attendanceId: Attendance.id,
    }).from(Kids)
        .leftJoin(Attendance, eq(Kids.id, Attendance.kidId))
        .where(
            and(
                // Filter by age range instead of exact age group match
                between(
                    // Convert string age to number for comparison
                    sql`CAST(${Kids.age} AS UNSIGNED)`, 
                    min, 
                    max
                ),
                or(
                    eq(Attendance.date, month),
                    isNull(Attendance.date)
                )
            )
        );

        console.log('Database result:', result);

        return NextResponse.json(result);

    } catch (error) {
        console.error('API Error:', error);
        return NextResponse.json({ error: error });
    }
}

export async function POST( req: NextRequest ) {
    const data = await req.json();
    const result = await db.insert(Attendance).values({
        kidId: data.kidId,
        present: data.present,
        day: data.day,
        date: data.date,
    })

    return NextResponse.json(result);
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const kidId = searchParams.get('kidId');
    const date = searchParams.get("date");
    const day = searchParams.get("day");

    if (!kidId || !day || !date) {
      return NextResponse.json({ error: 'kidId, day, and date are required' }, { status: 400 });
    }

    const result = await db.delete(Attendance)
      .where(
        and(
          eq(Attendance.kidId, Number(kidId)),
          eq(Attendance.day, Number(day)),
          eq(Attendance.date, date)
        )
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ error: 'Failed to delete attendance record' }, { status: 500 });
  }
}
