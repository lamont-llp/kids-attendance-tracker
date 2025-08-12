import { int, mysqlTable, varchar, timestamp, boolean } from 'drizzle-orm/mysql-core';
import { relations } from 'drizzle-orm';

const timestamps = {
  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at')
    .defaultNow()
    .notNull()
    .$onUpdate(() => new Date()),
};

export const ageGroup = mysqlTable('age_group', {
  id: int('id').primaryKey().autoincrement(),
  group: varchar({ length: 10 }).notNull(),
});

export const Guardians = mysqlTable('guardians', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 50 }).notNull(),
  contact: varchar('contact', { length: 11 }).notNull(),
  ...timestamps,
});

export const Kids = mysqlTable('kids', {
  id: int('id').primaryKey().autoincrement(),
  name: varchar('name', { length: 20 }).notNull(),
  age: varchar('age', { length: 10 }).notNull(),
  address: varchar('address', { length: 50 }),
  contact: varchar('contact', { length: 11 }),

  guardian_id: int('guardian_id', { unsigned: true }).references(() => Guardians.id),
  isVisitor: boolean('isVisitor').default(false),
  ...timestamps,
});

export const Attendance = mysqlTable('attendance', {
  id: int('id').primaryKey().autoincrement(),

  kidId: int('kidId', { unsigned: true })
    .notNull()
    .references(() => Kids.id),
  present: boolean('present').default(false),
  day: int('day').notNull(),
  date: varchar('date', { length: 20 }).notNull(),
  checkInTime: timestamp('checkInTime', { mode: 'date' }).notNull().defaultNow(),
});

// Define relations
export const guardiansRelations = relations(Guardians, ({ many }) => ({
  kids: many(Kids),
}));

export const kidsRelations = relations(Kids, ({ one }) => ({
  guardian: one(Guardians, {
    fields: [Kids.guardian_id],
    references: [Guardians.id],
  }),
}));

export const attendanceRelations = relations(Attendance, ({ one }) => ({
  kid: one(Kids, {
    fields: [Attendance.kidId],
    references: [Kids.id],
  }),
}));

// Updated interfaces to match the schema
export interface Guardian {
  id: number;
  name: string;
  contact: string;
  created_at: Date;
  updated_at: Date;
}

export interface Kid {
  id: number;
  name: string;
  age: string;
  address: string | null;
  contact: string | null;
  guardian_id: number | null;
  isVisitor: boolean | null;
  created_at: Date;
  updated_at: Date;
  // For queries with relations
  guardian?: Guardian;
}

export interface AttendanceRecord {
  id: number;
  kidId: number;
  present: boolean | null;
  day: number;
  date: string;
  // For queries with relations
  kid?: {
    id: number;
    name: string;
    age: string;
    contact?: string | null;
    address?: string | null;
    guardian_id?: number | null;
    isVisitor: boolean;
    created_at: string;
    updated_at: string;
    guardian_name?: string | null; // Add this
  };
}
