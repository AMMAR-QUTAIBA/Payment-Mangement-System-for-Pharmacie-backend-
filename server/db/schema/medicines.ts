import { integer, sqliteTable,text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { section } from "./section";
import { sql } from "drizzle-orm";
export const medicine=sqliteTable('medicine',
    {
        id:integer("id").primaryKey({autoIncrement:true}),
        medicine_name:text("medicine_name").notNull().unique(),
        price:integer("price").notNull(),
        expire:integer('expair').notNull(),
       addedAt:text("addedAt").default(sql`CURRENT_TIMESTAMP`).notNull(),  
        addedBy:integer("addedBy").references(()=>users.id).notNull(),
        section:integer("section").references(()=>section.sectionid),
        medicine_Amount:integer("medicine_Amount").notNull(),
        category:text("catgory").notNull(),
        description:text("description").notNull(),
        manufacture:text("manfacture").notNull(),
        image:text("image").notNull(),
    })