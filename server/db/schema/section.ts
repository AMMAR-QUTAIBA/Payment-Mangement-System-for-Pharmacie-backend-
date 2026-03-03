import { integer, sqliteTable,text } from "drizzle-orm/sqlite-core";
export const section=sqliteTable('section',{
    sectionid:integer('sesctionid').primaryKey({autoIncrement:true}),
    name:text("name").notNull().unique(),
    description:text("description").notNull(),
    
})