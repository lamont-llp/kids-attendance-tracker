import { NextResponse } from 'next/server';
import { db } from '@/utils';
import { Attendance } from '@/utils/schema';

export async function GET() {
    try {
        // Get all unique dates from attendance records
        const availableDates = await db
            .select({ date: Attendance.date })
            .from(Attendance)
            .groupBy(Attendance.date)
            .orderBy(Attendance.date);

        // Extract unique months from available dates
        const monthSet = new Set<string>();
        availableDates.forEach(item => {
            if (item.date) {
                const parts = item.date.split('/');
                if (parts.length === 3) {
                    const day = parts[0];
                    const month = parts[1];
                    const year = parts[2];
                    // Format as MM/YYYY for consistency with frontend
                    monthSet.add(`${month}/${year}`);
                }
            }
        });

        const availableMonths = Array.from(monthSet).sort((a, b) => {
            // Sort by year first, then by month
            const [monthA, yearA] = a.split('/').map(Number);
            const [monthB, yearB] = b.split('/').map(Number);
            if (yearA !== yearB) return yearA - yearB;
            return monthA - monthB;
        });

        return NextResponse.json({
            availableMonths,
            totalRecords: availableDates.length
        });
    } catch (error) {
        console.error('Error getting available months:', error);
        return NextResponse.json(
            { error: 'Failed to get available months' },
            { status: 500 }
        );
    }
}
