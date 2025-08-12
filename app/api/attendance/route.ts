import { db } from '@/utils';
import { Attendance, Guardians, Kids } from '@/utils/schema';
import { and, eq, or, isNull, between, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';
import { SmsDepotService } from '@/app/services/sms-depot';

const smsDepotService = new SmsDepotService();

/**
 * Gets the age range for a given age group
 * @param ageGroup The age group (e.g., "2-5yrs", "6-9yrs", "10-13yrs")
 * @returns An object with min and max age values
 */
function getAgeRangeFromGroup(ageGroup: string): { min: number; max: number } {
  switch (ageGroup) {
    case '2-5yrs':
      return { min: 2, max: 5 };
    case '6-9yrs':
      return { min: 6, max: 9 };
    case '10-13yrs':
      return { min: 10, max: 13 };
    case 'all':
      return { min: 0, max: 100 };
    default:
      return { min: 0, max: 0 }; // Default case, should not happen
  }
}

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const ageGroup = searchParams.get('ageGroup');
    const month = searchParams.get('month');

    console.log('API received:', { ageGroup, month });

    if (!month) {
      return NextResponse.json({ error: 'Missing required month parameter' });
    }

    // For kiosk check-in verification, we may not have an ageGroup
    // If ageGroup is missing, return all attendance records for the month
    if (!ageGroup) {
      const result = await db
        .select({
          name: Kids.name,
          present: Attendance.present,
          day: Attendance.day,
          date: Attendance.date,
          age: Kids.age,
          kidId: Kids.id,
          attendanceId: Attendance.id,
        })
        .from(Kids)
        .leftJoin(Attendance, eq(Kids.id, Attendance.kidId))
        .where(or(eq(Attendance.date, month), isNull(Attendance.date)));

      return NextResponse.json(result);
    }
    // Get the age range for the selected age group
    const { min, max } = getAgeRangeFromGroup(ageGroup);

    const result = await db
      .select({
        name: Kids.name,
        present: Attendance.present,
        day: Attendance.day,
        date: Attendance.date,
        age: Kids.age, // Now storing actual age
        kidId: Kids.id,
        attendanceId: Attendance.id,
        guardian_name: Guardians.name,
      })
      .from(Kids)
      .leftJoin(Attendance, eq(Kids.id, Attendance.kidId))
      .leftJoin(Guardians, eq(Kids.guardian_id, Guardians.id))
      .where(
        and(
          // Filter by age range instead of exact age group match
          between(
            // Convert string age to number for comparison
            sql`CAST(${Kids.age} AS UNSIGNED)`,
            min,
            max,
          ),
          or(eq(Attendance.date, month), isNull(Attendance.date)),
        ),
      );

    //console.log('Database result:', result);

    return NextResponse.json(result);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error });
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Check if the kid is already checked in for this day and date
    const existingAttendance = await db
      .select()
      .from(Attendance)
      .where(
        and(
          eq(Attendance.kidId, data.kidId),
          eq(Attendance.day, data.day),
          eq(Attendance.date, data.date),
          eq(Attendance.present, true),
        ),
      );

    // If an attendance record already exists, return conflict status
    if (existingAttendance.length > 0) {
      return NextResponse.json({ error: 'Kid already checked in for today' }, { status: 409 });
    }

    // If no existing record, create a new attendance record
    const result = await db.insert(Attendance).values({
      kidId: data.kidId,
      present: data.present,
      day: data.day,
      date: data.date,
      // Add timestamp if it's included in the schema
      checkInTime: data.checkInTime,
    });

    // Get kid's name and guardian's contact information
    const kidInfo = await db
      .select({
        name: Kids.name,
        guardianContact: Kids.contact,
        guardianName: Guardians.name,
      })
      .from(Kids)
      .leftJoin(Guardians, eq(Kids.guardian_id, Guardians.id))
      .where(eq(Kids.id, data.kidId))
      .limit(1);

    if (kidInfo.length > 0 && kidInfo[0]?.guardianContact) {
      try {
        await smsDepotService.sendParentNotification(
          kidInfo[0].name,
          kidInfo[0].guardianContact,
          kidInfo[0].guardianName || 'parent/guardian',
        );
      } catch (error) {
        console.error('Failed to send SMS notification:', error);
        // Don't fail the check-in if SMS sending fails
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error marking attendance:', error);
    return NextResponse.json({ error: 'Failed to mark attendance' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const kidId = searchParams.get('kidId');
    const date = searchParams.get('date');
    const day = searchParams.get('day');

    if (!kidId || !day || !date) {
      return NextResponse.json({ error: 'kidId, day, and date are required' }, { status: 400 });
    }

    const result = await db
      .delete(Attendance)
      .where(
        and(
          eq(Attendance.kidId, Number(kidId)),
          eq(Attendance.day, Number(day)),
          eq(Attendance.date, date),
        ),
      );

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting attendance:', error);
    return NextResponse.json({ error: 'Failed to delete attendance record' }, { status: 500 });
  }
}
