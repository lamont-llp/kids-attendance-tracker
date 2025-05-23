import { int, mysqlTable, serial, varchar, timestamp } from 'drizzle-orm/mysql-core';
import {relations} from "drizzle-orm";

const timestamps = {
    created_at: timestamp("created_at").defaultNow().notNull(),
    updated_at: timestamp("updated_at").defaultNow().notNull().$onUpdate(() => new Date()),
}

export const ageGroup = mysqlTable('age_group', {
    id: serial().primaryKey(),
    group: varchar({ length: 10 }).notNull()
});

export const Kids = mysqlTable('kids', {
    id: serial("id").primaryKey(),
    name: varchar('name',{ length: 20 }).notNull(),
    age: varchar('age',{ length: 10 }).notNull(),
    address: varchar('address',{ length: 50 }),
    contact: varchar('contact',{ length: 11}),
    ...timestamps
})

// Create relations
