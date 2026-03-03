import { int, integer, sqliteTable,text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { section } from "./section";
import { sql } from "drizzle-orm";
import { medicine } from "./medicines";
import { bills_product } from "./bills_product";
export const bills=sqliteTable('bills',{
id:integer("id").primaryKey({autoIncrement:true}),
user_sell:integer("user_sell").references(()=>users.id).notNull(),
bill_Date:integer("bill_Date").default(sql`CURRENT_TIMESTAMP`).notNull(),
total_price:integer("total_price").notNull(),
payment_type:text("payment_type").notNull(),
card_token:text("card_token").default(sql`null`),
card_salt:text("card_salt").default(sql`null`),
custumer_last_4Number:text("last card 4Number").default(sql`null`),
})