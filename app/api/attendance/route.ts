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

export async function DELETE( req: NextRequest ){

    const searchParams = req.nextUrl.searchParams;
    const kidId = searchParams.get('kidId');
    const date = searchParams.get("date");
    const day = searchParams.get("day");

    if (!kidId || !day || !date) {
        throw new Error('kidId, day, and date are required');
    }
    const result = await db.delete(Attendance)
        .where(
            and(
                eq(Attendance.kidId, Number(kidId)),
                eq(Attendance.day, Number(day)),
                eq(Attendance.date, date)
            )
        )

    return NextResponse.json(result);
}