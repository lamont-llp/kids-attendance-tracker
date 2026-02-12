import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { eq, and, between, sql } from 'drizzle-orm';
import { Kids, Attendance } from '@/utils/schema';
import { format, isValid, parseISO } from 'date-fns';
import { getAgeRangeFromGroup } from '@/utils/ageGroupUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const ageGroup = searchParams.get('ageGroup');

    // Validate required parameters
    if (!startDate || !endDate || !ageGroup) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
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

    // Get age range for filtering
    const { min, max } = getAgeRangeFromGroup(ageGroup);

    // Build where conditions
    const whereConditions = [
      between(Attendance.date, startDate, endDate)
    ];

    // Add age filter if not 'all'
    if (ageGroup !== 'all') {
      whereConditions.push(
        between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max)
      );
    }

    // Fetch attendance records with kid details
    const attendanceRecords = await db
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
      .leftJoin(Kids, eq(Attendance.kidId, Kids.id))
      .where(and(...whereConditions))
      .orderBy(Attendance.date, Kids.name);

    // Transform records to match the expected format
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      kidId: record.kidId,
      present: record.present,
      date: record.date,
      checkInTime: record.checkInTime,
      kid: {
        id: record.kidId,
        name: record.kid_name,
        age: record.kid_age,
        isVisitor: record.kid_isVisitor
      }
    }));

    return NextResponse.json({ data: formattedRecords });
  } catch (error) {
    console.error('Error in date range query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}