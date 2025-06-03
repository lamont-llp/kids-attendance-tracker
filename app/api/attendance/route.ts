import {db} from "@/utils";
import {Attendance, Kids} from "@/utils/schema";
import {and, eq, or, isNull} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

export async function GET( req: NextRequest ){

    try {
        const searchParams = req.nextUrl.searchParams;
        const ageGroup = searchParams.get("ageGroup");
        const month = searchParams.get("month");

        console.log('API received:', { ageGroup, month });

        if (!ageGroup || !month) {
            return NextResponse.json({ error: 'Missing required parameters' });
        }
    const result = await db.select({
        name: Kids.name,
        present: Attendance.present,
        day: Attendance.day,
        date: Attendance.date,
        ageGroup: Kids.age,
        kidId: Kids.id,
        attendanceId: Attendance.id,
    }).from(Kids)
        .leftJoin(Attendance, eq(Kids.id, Attendance.kidId))
        .where(
            and(
                eq(Kids.age, ageGroup),
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