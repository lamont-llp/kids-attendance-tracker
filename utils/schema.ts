import { int, mysqlTable, serial, varchar } from 'drizzle-orm/mysql-core';

export const ageGroup = mysqlTable('age_group', {
    id: serial().primaryKey(),
    group: varchar({ length: 10 }).notNull()
});

export const Kids = mysqlTable('kids', {
    id: serial().primaryKey(),
    name: varchar('name',{ length: 20 }).notNull(),
    ageGroup: varchar('ageGroup',{ length: 20 }).notNull(),
    address: varchar('address',{ length: 50 }),
    contact: varchar('contact',{ length: 11}),
})