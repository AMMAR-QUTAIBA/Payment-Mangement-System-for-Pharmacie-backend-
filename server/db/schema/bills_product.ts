import { integer, sqliteTable,text } from "drizzle-orm/sqlite-core";
import { users } from "./users";
import { section } from "./section";
import { sql } from "drizzle-orm";
import { medicine } from "./medicines";
import { bills } from "./bills";
export const bills_product=sqliteTable('bills_product',{
id:integer("id").primaryKey({autoIncrement:true}),
medicine_id:integer("medicine_id").references(()=>medicine.id).notNull(),
bill_id:integer("bill_id").references(()=>bills.id).notNull(),
quantity:integer("quantity").notNull(),
product_price:integer("product_price"),
})