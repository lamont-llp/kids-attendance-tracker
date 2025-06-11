import { int, mysqlTable, serial, varchar, timestamp, boolean, bigint } from 'drizzle-orm/mysql-core';
import { relations } from "drizzle-orm";

const timestamps = {
  created_at: timestamp("created_at").defaultNow().notNull(),
  updated_at: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}

export const ageGroup = mysqlTable('age_group', {
  id: serial().primaryKey(),
  group: varchar({ length: 10 }).notNull()
});

export const guardians = mysqlTable('guardians', {
  id: serial().primaryKey(),
  name: varchar('name', { length: 50 }).notNull(),
  contact: varchar('contact', { length: 11 }).notNull(),
  ...timestamps
});

export const Kids = mysqlTable('kids', {
  id: serial("id").primaryKey(),
  name: varchar('name', { length: 20 }).notNull(),
  age: varchar('age', { length: 10 }).notNull(),
  address: varchar('address', { length: 50 }),
  contact: varchar('contact', { length: 11 }),
  guardian_id: bigint('guardian_id', { mode: 'number', unsigned: true }),
  ...timestamps
})

export const Attendance = mysqlTable('attendance', {
  id: serial("id").primaryKey(),
  kidId: int('kidId').notNull(),
  present: boolean('present').default(false),
  day: int('day').notNull(),
  date: varchar('date', { length: 20 }).notNull(),
})

// Define relations
export const guardiansRelations = relations(guardians, ({ many }) => ({
  kids: many(Kids),
}));

export const kidsRelations = relations(Kids, ({ one }) => ({
  guardian: one(guardians, {
    fields: [Kids.guardian_id],
    references: [guardians.id],
  }),
}));

export const attendanceRelations = relations(Attendance, ({ one }) => ({
  kid: one(Kids, {
    fields: [Attendance.kidId],
    references: [Kids.id],
  }),
}));
