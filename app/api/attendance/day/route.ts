import {db} from "@/utils";
import {Attendance, Kids} from "@/utils/schema";
import {getAgeRangeFromGroup} from "@/app/api/attendance/route"
import {and, eq, or, isNull, between, sql} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest) {
    try {
        const searchParams = req.nextUrl.searchParams;
        const day = searchParams.get("day");
        const month = searchParams.get("month");
        const ageGroup = searchParams.get("ageGroup");

        if (!day || !month) {
            return NextResponse.json(
                { error: 'Missing required parameters: day, month' },
                { status: 400 }
            );
        }

        const { min, max } = getAgeRangeFromGroup(ageGroup || 'all');

        // Get all kids with their attendance for specific day
        const result = await db.select({
            name: Kids.name,
            present: sql`COALESCE(${Attendance.present}, false)`.as('present'),
            day: sql`${day}`.as('day'),
            date: sql`${month}`.as('date'),
            age: Kids.age,
            kidId: Kids.id,
            attendanceId: Attendance.id,
            checkInTime: sql`DATE_FORMAT(${Attendance.created_at}, '%H:%i')`.as('checkInTime'), // If you have timestamps
        }).from(Kids)
            .leftJoin(Attendance, and(
                eq(Kids.id, Attendance.kidId),
                eq(Attendance.date, month),
                eq(Attendance.day, parseInt(day))
            ))
            .where(
                ageGroup ?
                    between(sql`CAST(${Kids.age} AS UNSIGNED)`, min, max) :
                    sql`1=1`
            )
            .orderBy(Kids.name);

        const transformedResult = result.map(record => ({
            name: record.name,
            present: Boolean(record.present),
            day: parseInt(day),
            date: month,
            age: record.age,
            kidId: record.kidId,
            attendanceId: record.attendanceId,
            checkInTime: record.checkInTime
        }));

        return NextResponse.json(transformedResult);

    } catch (error) {
        console.error('Day attendance API Error:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}