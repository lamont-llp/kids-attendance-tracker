import {db} from "../../../utils";
import {Attendance, Kids} from "../../../utils/schema";
import {and, desc, eq, sql} from "drizzle-orm";
import {NextResponse} from "next/server";

export async function GET(req){
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const ageGroup = searchParams.get('ageGroup');

    const result = await db.select({
        day: Attendance.day,
        presentCount: sql`count(${Attendance.day})`
    }).from(Attendance)
        .leftJoin(Kids, and (eq(Attendance.kidId, Kids.id), eq(Attendance.date, date)))
        .where(eq(Kids.age, ageGroup))
        .groupBy(Attendance.day)
        .orderBy(desc(Attendance.day))
        .limit(7)

    return NextResponse.json(result);
}