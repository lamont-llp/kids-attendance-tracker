// app/api/kid/route.ts
import { db } from '@/utils';
import { Kids } from '@/utils/schema';
import { NextResponse } from 'next/server';

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