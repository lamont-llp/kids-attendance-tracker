import { db } from '@/utils';
import { Attendance, Kids } from '@/utils/schema';
//import { getAgeRangeFromGroup } from "@/app/api/attendance/route"
import { and, eq, or, isNull, between, sql } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const month = searchParams.get('month');
    const ageGroup = searchParams.get('ageGroup');

    if (!month) {
      return NextResponse.json({ error: 'Missing required parameter: month' }, { status: 400 });
    }

    {
      /*
        const { min, max } = getAgeRangeFromGroup(ageGroup || 'all');

        // Get total kids count for age group
        const totalKidsResult = await db.select({
            count: sql`COUNT(*)`.as('count')
        }).from(Kids)
            .where(
                ageGroup ?
                    between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max) :
                    sql`1=1`
            );

        const totalKids = totalKidsResult[0]?.count || 0;
        */
    }

    // Get daily attendance counts
    {
      /*
        const dailyStats = await db.select({
            day: Attendance.day,
            presentCount: sql`COUNT(*)`.as('presentCount'),
            date: Attendance.date
        }).from(Attendance)
            .innerJoin(Kids, eq(Kids.id, Attendance.kidId))
            .where(
                and(
                    eq(Attendance.date, month),
                    eq(Attendance.present, true),
                    ageGroup ?
                        between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max) :
                        sql`1=1`
                )
            )
            .groupBy(Attendance.day, Attendance.date)
            .orderBy(Attendance.day);

        // Calculate monthly totals
        const totalAttendanceRecords = dailyStats.reduce((sum, day) => sum + day.presentCount, 0);
        const numberOfSundays = dailyStats.length;
        const monthlyAttendanceRate = numberOfSundays > 0 ?
            (totalAttendanceRecords / (totalKids * numberOfSundays)) * 100 : 0;

        return NextResponse.json({
            totalKids,
            dailyStats,
            monthlyStats: {
                totalAttendanceRecords,
                numberOfSundays,
                monthlyAttendanceRate: Math.round(monthlyAttendanceRate * 10) / 10,
                averageAttendance: numberOfSundays > 0 ?
                    Math.round((totalAttendanceRecords / numberOfSundays) * 10) / 10 : 0
            }
        });
        */
    }
  } catch (error) {
    console.error('Stats API Error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
