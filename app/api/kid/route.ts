// app/api/kid/route.ts
import { db } from '@/utils';
import { Guardians, Kids } from '@/utils/schema';
import { NextRequest, NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

export async function POST(req: Request) {
  try {
    const data = await req.json();

    // Optional: basic validation
    if (!data?.name || !data?.age) {
      return NextResponse.json({ message: 'Missing required fields' }, { status: 400 });
    }

    const result = await db
      .insert(Kids)
      .values({
        name: data.name,
        age: data.age,
        address: data.address || '',
        contact: data.contact || '',
        isVisitor: data.isVisitor || false,
      })
      .$returningId(); // to get inserted record if needed

    return NextResponse.json(result[0], { status: 201 });
  } catch (error) {
    console.error('Error inserting kid:', error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const result = await db
      .select({
        id: Kids.id,
        name: Kids.name,
        age: Kids.age,
        contact: Kids.contact,
        address: Kids.address,
        guardian_id: Kids.guardian_id,
        is_visitor: Kids.isVisitor,
        created_at: Kids.created_at,
        updated_at: Kids.updated_at,
        guardian_name: Guardians.name,
      })
      .from(Kids)
      .leftJoin(Guardians, eq(Kids.guardian_id, Guardians.id));

    console.log(result);
    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.log('Error getting kids: ', error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();
    const searchParams = req.nextUrl.searchParams;
    const id = searchParams.get('id');

    // Validation
    if (!id) {
      return NextResponse.json({ message: 'ID is required' }, { status: 400 });
    }

    if (!data?.name || !data?.age) {
      return NextResponse.json(
        { message: 'Missing required fields (name and age)' },
        { status: 400 },
      );
    }

    // Update the kid record
    const result = await db
      .update(Kids)
      .set({
        name: data.name,
        age: data.age,
        address: data.address || '',
        contact: data.contact || '',
        isVisitor: data.isVisitor || false,
      })
      .where(eq(Kids.id, parseInt(id)));

    // Just assume the update succeeded if no error was thrown
    return NextResponse.json(
      { message: 'Kid updated successfully', id: parseInt(id) },
      { status: 200 },
    );
  } catch (error) {
    console.error('Error updating kid:', error);
    return NextResponse.json({ message: 'Server error', error }, { status: 500 });
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
