import {db} from "../../../utils";
import {Attendance, Kids} from "../../../utils/schema";
import {and, desc, eq, sql} from "drizzle-orm";
import {NextRequest, NextResponse} from "next/server";

export async function GET(req: NextRequest){
    const searchParams = req.nextUrl.searchParams;
    const date = searchParams.get('date');
    const ageGroup = searchParams.get('ageGroup');

    const result = await db.select({
        day: Attendance.day,
        presentCount: sql`count(${Attendance.day})`
    }).from(Attendance)
        .leftJoin(Kids, and(eq(Attendance.kidId, Kids.id), date ? eq(Attendance.date, date) : undefined))
        .where(ageGroup ? eq(Kids.age, ageGroup) : undefined)
        .groupBy(Attendance.day)
        .orderBy(desc(Attendance.day))
        .limit(7)

    return NextResponse.json(result);
}
