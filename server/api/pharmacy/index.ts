import { db } from "@/server/db/config/db_config";
import { medicine } from "@/server/db/schema/medicines";
import { Hono } from "hono";
import { count } from "drizzle-orm";

const app = new Hono()
.get('/', async (c) => {
  const page = Number(c.req.query('page') ?? 1)
  const pagesize = 15
  try {
    const medicin = await db.select().from(medicine).limit(pagesize).offset((page - 1) * pagesize)
    const [total] = await db.select({ count: count() }).from(medicine)
    return c.json({ data: medicin, page, pagesize, total: total.count });
  } catch {
    return c.json({ error: "Database error" }, 500)
  }
})
export default app