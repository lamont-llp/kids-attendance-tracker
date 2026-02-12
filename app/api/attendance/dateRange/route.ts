import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { eq, and, between, sql } from 'drizzle-orm';
import { Kids, Attendance, Guardians } from '@/utils/schema';
import { isValid, parseISO } from 'date-fns';
import { getAgeRangeFromGroup } from '@/utils/ageGroupUtils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const ageGroup = searchParams.get('ageGroup');

    console.log('📅 [Attendance Search] Input params:', { startDate, endDate, ageGroup });

    // Validate required parameters
    if (!startDate || !endDate || !ageGroup) {
      console.log('❌ [Attendance Search] Missing required parameters');
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    // Validate date formats
    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = parseISO(endDate);

    if (!isValid(parsedStartDate) || !isValid(parsedEndDate)) {
      console.log('❌ [Attendance Search] Invalid date format');
      return NextResponse.json(
        { error: 'Invalid date format. Use YYYY-MM-DD' },
        { status: 400 }
      );
    }

    // Get age range for filtering
    const { min, max } = getAgeRangeFromGroup(ageGroup);
    console.log('👶 [Attendance Search] Age range:', { ageGroup, min, max });

    // Build where conditions
    // Note: Dates in DB are stored as DD/MM/YYYY format (e.g., '08/02/2026' for Feb 8, 2026)
    // We need to convert the varchar date to a proper date for comparison
    const whereConditions = [
      sql`STR_TO_DATE(${Attendance.date}, '%d/%m/%Y') BETWEEN ${startDate} AND ${endDate}`
    ];

    // Add age filter if not 'all'
    if (ageGroup !== 'all') {
      whereConditions.push(
        between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max)
      );
    }

    console.log('🔍 [Attendance Search] Where conditions:', { 
      dateRange: `${startDate} to ${endDate}`,
      ageFilter: ageGroup !== 'all' ? `${min}-${max}` : 'all' 
    });

    // Fetch attendance records with kid details
    const attendanceRecords = await db
      .select({
        id: Attendance.id,
        kidId: Attendance.kidId,
        present: Attendance.present,
        date: Attendance.date,
        day: Attendance.day,
        checkInTime: Attendance.checkInTime,
        kid_name: Kids.name,
        kid_age: Kids.age,
        kid_isVisitor: Kids.isVisitor,
        kid_contact: Kids.contact,
        kid_address: Kids.address,
        kid_guardian_id: Kids.guardian_id,
        guardian_name: Guardians.name,
      })
      .from(Attendance)
      .leftJoin(Kids, eq(Attendance.kidId, Kids.id))
      .leftJoin(Guardians, eq(Kids.guardian_id, Guardians.id))
      .where(and(...whereConditions))
      .orderBy(Attendance.date, Kids.name);

    console.log('💾 [Attendance Search] DB records found:', attendanceRecords.length);

    // Transform records to match the expected format
    const formattedRecords = attendanceRecords.map(record => ({
      id: record.id,
      kidId: record.kidId,
      present: record.present,
      day: record.day,
      date: record.date,
      checkInTime: record.checkInTime,
      kid: {
        id: record.kidId,
        name: record.kid_name,
        age: record.kid_age,
        isVisitor: record.kid_isVisitor,
        contact: record.kid_contact,
        address: record.kid_address,
        guardian_id: record.kid_guardian_id,
        guardian_name: record.guardian_name
      }
    }));

    console.log('✅ [Attendance Search] Final records:', formattedRecords.length);
    console.log('📊 [Attendance Search] Sample record:', formattedRecords[0]);

    return NextResponse.json({ data: formattedRecords });
  } catch (error) {
    console.error('Error in date range query:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}