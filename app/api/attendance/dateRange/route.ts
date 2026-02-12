import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { eq, and, between, sql, inArray } from 'drizzle-orm';
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

    // Convert date range to MM/yyyy format(s) since DB stores dates as "MM/yyyy"
    // Generate all months in the range
    const startMonth = parsedStartDate.getMonth();
    const startYear = parsedStartDate.getFullYear();
    const endMonth = parsedEndDate.getMonth();
    const endYear = parsedEndDate.getFullYear();
    
    const monthsInRange: string[] = [];
    let currentDate = new Date(startYear, startMonth, 1);
    const endDate_obj = new Date(endYear, endMonth, 1);
    
    while (currentDate <= endDate_obj) {
      const monthStr = String(currentDate.getMonth() + 1).padStart(2, '0');
      const yearStr = String(currentDate.getFullYear());
      monthsInRange.push(`${monthStr}/${yearStr}`);
      currentDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    }

    console.log('📆 [Attendance Search] Months in range:', monthsInRange);

    // Build where conditions
    const whereConditions = [
      inArray(Attendance.date, monthsInRange)
    ];

    // Add age filter if not 'all'
    if (ageGroup !== 'all') {
      whereConditions.push(
        between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max)
      );
    }

    console.log('🔍 [Attendance Search] Where conditions:', { 
      monthsFilter: monthsInRange, 
      ageFilter: ageGroup !== 'all' ? `${min}-${max}` : 'all' 
    });

    // Debug: Check what attendance records exist
    const allAttendance = await db
      .select({
        date: Attendance.date,
        count: sql`COUNT(*)`
      })
      .from(Attendance)
      .groupBy(Attendance.date)
      .limit(10);
    console.log('🔎 [DEBUG] Sample attendance dates in DB:', allAttendance);

    // Debug: Check what kids exist in the age range
    const kidsInAgeRange = await db
      .select({
        id: Kids.id,
        name: Kids.name,
        age: Kids.age,
      })
      .from(Kids)
      .where(
        ageGroup !== 'all' 
          ? between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max)
          : undefined
      )
      .limit(5);
    console.log('🔎 [DEBUG] Kids in age range:', kidsInAgeRange);

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

    // Filter by actual day range and transform records to match the expected format
    const startDay = parsedStartDate.getDate();
    const endDay = parsedEndDate.getDate();
    
    console.log('🗓️  [Attendance Search] Day range filter:', { 
      startDay, 
      endDay, 
      singleMonth: monthsInRange.length === 1 
    });
    
    const formattedRecords = attendanceRecords
      .filter(record => {
        if (!record.day) return false;
        
        // If single month, filter by day range
        if (monthsInRange.length === 1) {
          return record.day >= startDay && record.day <= endDay;
        }
        
        // For multiple months, check first and last month boundaries
        const recordMonthYear = record.date;
        const firstMonth = monthsInRange[0];
        const lastMonth = monthsInRange[monthsInRange.length - 1];
        
        if (recordMonthYear === firstMonth) {
          return record.day >= startDay;
        } else if (recordMonthYear === lastMonth) {
          return record.day <= endDay;
        }
        
        // Middle months - include all days
        return true;
      })
      .map(record => ({
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

    console.log('✅ [Attendance Search] Final records after day filtering:', formattedRecords.length);
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