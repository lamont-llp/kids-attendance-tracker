// app/api/kid/route.ts
import { db } from '@/utils';
import { Kids } from '@/utils/schema';
import {NextRequest, NextResponse} from 'next/server';
import {eq} from "drizzle-orm";

export async function POST(req: Request) {
    try {
        const data = await req.json();

        // Optional: basic validation
        if (!data?.name || !data?.age) {
            return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
        }

        const result = await db.insert(Kids).values({
            name: data.name,
            age: data.age,
            address: data.address || '',
            contact: data.contact || '',
            isVisitor: data.isVisitor || false,
        }).$returningId(); // to get inserted record if needed

        return NextResponse.json(result[0], { status: 201 });
    } catch (error) {
        console.error('Error inserting kid:', error);
        return NextResponse.json({ message: 'Server error', error }, { status: 500 });
    }
}

export async function GET(req: Request) {
    try {
        const result = await db.select().from(Kids);
        return NextResponse.json(result, { status: 200 })
    }
    catch (error) {
        console.log('Error getting kids: ', error);
        return NextResponse.json({ message: 'Server error', error }, { status: 500});
    }
}

export async function DELETE(req: NextRequest) {
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    if (!id) {
        return NextResponse.json({ error: 'ID is required' }, { status: 400 });
    }

    try {
        const result = await db.delete(Kids).where(eq(Kids.id, parseInt(id)));
        return NextResponse.json(result);
    } catch (error) {
        console.error('Error deleting kid:', error);
        return NextResponse.json({ error: 'Failed to delete record' }, { status: 500 });
    }
}