import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { ageGroup } from '@/utils/schema';

export async function GET(req: Request) {
  const result = await db.select().from(ageGroup);
  return NextResponse.json(result);
}
