import { users } from "./users";
import { integer, sqliteTable,text } from "drizzle-orm/sqlite-core";
export const session=sqliteTable('session',{
    sessionid:text('session').primaryKey(),
    userid:integer("userid").references(()=>users.id).notNull(),
    createdAt:text('creatAt').notNull(),
    
})