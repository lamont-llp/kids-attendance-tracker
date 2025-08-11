import { AttendanceRecord, Kid } from '@/utils/schema';

export function makeKid(overrides: Partial<Kid> = {}): Kid {
  const base: Kid = {
    id: 1,
    name: 'John Doe',
    age: '8',
    address: '123 Main St',
    contact: '5551234567',
    guardian_id: 1,
    isVisitor: false,
    created_at: new Date(),
    updated_at: new Date(),
  };
  return { ...base, ...overrides };
}

export function makeAttendanceRecord(overrides: Partial<AttendanceRecord> = {}): AttendanceRecord {
  const base: AttendanceRecord = {
    id: 10,
    kidId: 1,
    present: true,
    day: 1,
    date: '2025-01-01',
    kid: {
      id: 1,
      name: 'John Doe',
      age: '8',
      contact: '5551234567',
      address: '123 Main St',
      guardian_id: 1,
      isVisitor: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      guardian_name: 'Jane Doe',
    },
  };
  return { ...base, ...overrides };
}
