import {db} from "@/utils";
import {Kids} from "@/utils/schema";
import {NextResponse} from "next/server";

export async function POST(req: Request, res: NextResponse) {
    const data = await req.json()

    const result = await db.insert(Kids).values({
        name: data?.name,
        ageGroup: data?.ageGroup,
        address: data?.address,
        contact: data?.contact,
    })

    return NextResponse.json(result);
}