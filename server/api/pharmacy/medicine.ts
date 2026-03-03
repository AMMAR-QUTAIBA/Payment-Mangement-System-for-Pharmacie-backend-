import { db } from "@/server/db/config/db_config";
import { medicine } from "@/server/db/schema/medicines";
import { Hono } from "hono";
import { eq, and, desc, lte, gte, or } from "drizzle-orm";
import { isadmin } from "@/server/auth/action";
import { sendMail } from "@/lib/auth/send-mail"
import fs from "fs"

import { buffer } from "stream/consumers";
const app = new Hono()
.get('/medicine/filter', async (c) => {
    const data = c.req.query()
    const page = Number(c.req.query('page') ?? 1)
  const pagesize = 15
    try {
      
      const fields: {key: string, col: any, num?: boolean}[] = [
        { key: 'medicine_name', col: medicine.medicine_name },
        { key: 'manfacture',    col: medicine.manufacture },
        { key: 'category',      col: medicine.category },
        { key: 'addat',         col: medicine.addedAt },
        { key: 'price',         col: medicine.price,           num: true },
        { key: 'medicine_Amount', col: medicine.medicine_Amount, num: true },
        { key: 'addedBy',       col: medicine.addedBy,         num: true },
        { key: 'expire',        col: medicine.expire,          num: true },
        { key: 'section',       col: medicine.section,         num: true },
      ]
      const conditions = fields
        .filter(f => data[f.key])
        .map(f => eq(f.col, f.num ? Number(data[f.key]) : data[f.key]))
            
      const filter = await db.select().from(medicine).where(and(...conditions)).offset((page - 1) * pagesize).limit(pagesize)
      return c.json(filter)
    } catch {
      return c.json({error: "Database error"}, 500)
    }
})
.get("/medicine/expire",async(c)=>{
    const threeDaysFromNow = Date.now() + 3 * 24 * 60 * 60 * 1000
    try {
      
       const data = await db.select().from(medicine).where(lte(medicine.expire, threeDaysFromNow)).orderBy(medicine.expire)
       if(!data||data.length==0)
          return c.json({error: "medicine not found"}, 404)
       const names_expair = data.map((item) => `${item.medicine_name} (expire: ${new Date(item.expire).toLocaleDateString()})`).join("\n"); 
       await sendMail(names_expair)
       return c.json({medicine: data})
       

     
    } catch(error) {
        console.log(error)
        return c.json({error: "Database error"}, 500)
    }
})
.get("/:id", async (c) => {
    const id = Number(c.req.param("id"))
    if (!id || isNaN(id))
      return c.json({error: "invalid medicine id"}, 400)
    try {
      const [get_medicineById] = await db.select().from(medicine).where(eq(medicine.id, id))
      if (!get_medicineById) return c.json({error: "medicine not found"}, 404)
      return c.json(get_medicineById)
    } catch {
      return c.json({error: "error fetching medicine"}, 500)
    }
})
.post('/', async (c) => {
    const check = await isadmin()
    if (check == false)
      return c.json({error: "request denied, you are not admin"}, 403)
    const body = await c.req.parseBody()

    const medicine_name= String(body["medicine_name"]);
    const expire= new Date(String(body["expire"])).getTime();
    const medicine_Amount= Number(body["medicine_Amount"]);
    const manufacture= String(body["manufacture"]);
    const addedBy= Number(body["addedBy"]);
    const category= String(body["category"]);
    const description= String(body["description"]);
    const sectionId= Number(body["section"]);
    const price= Number(body["price"]);
    const image= body["image"];

    if(!(image instanceof File))return c.json({error: "image shoud be file"}, 400)
      const arraybuffer=await image.arrayBuffer()
       const buffer=await Buffer.from(arraybuffer)
       const filepath=`./public/uplods/${image.name}`
       
        const url=`/uplods/${image.name}`
    const checked = await check_data(medicine_name, expire, medicine_Amount, manufacture, addedBy, category, description, price, sectionId)
    if (checked.flag == false)
      return c.json({error: checked.message}, 400)

    try {
      
      await fs.promises.writeFile(filepath, buffer)
      const [save] = await db.insert(medicine).values({
        medicine_name, price, expire, medicine_Amount, manufacture,
        addedBy, category, description, section: sectionId, image: url
      }).returning()
      if (!save) {
     
        await fs.promises.unlink(filepath).catch(() => {})
        return c.json({error: "failed to save medicine"}, 500)
      }
      return c.json({message: "Medicine saved successfully", medicine: save})
    } catch (error) {
     
      await fs.promises.unlink(filepath).catch(() => {})
      return c.json({error: "error saving medicine"}, 500)
    }
})
.delete('/:id', async (c) => {
    const check = await isadmin()
    if (check == false)
      return c.json({error: "request denied, you are not admin"}, 403)
      const id = Number(c.req.param('id'))
      if (!id || isNaN(id))
        return c.json({error: "invalid medicine id"}, 400)
    try {
      const medicine_data=await db.select().from(medicine).where(eq(medicine.id,id))
      if(!medicine_data[0])
         return c.json({error: "medicine not found"}, 404)
      if(!medicine_data[0].image)
         return c.json({error: "image error"}, 400)
        await fs.promises.unlink(`./public${medicine_data[0].image}`)
      const [del] = await db.delete(medicine).where(eq(medicine.id, id)).returning()
      if (!del) 
        return c.json({error: "medicine not found"}, 404)
      return c.json({message: "medicine deleted successfully", medicine: del})
    } catch {
      return c.json({error: "delete error, try again"}, 500)
    }
})
.put("/:id", async (c) => {
    const check = await isadmin()
    if (check == false)
      return c.json({error: "request denied, you are not admin"}, 403)
    try {
      const id = Number(c.req.param('id'))
      if (!id || isNaN(id))
        return c.json({error: "invalid medicine id"}, 400)

       const body = await c.req.parseBody()
    const medicine_name= String(body["medicine_name"]);
    const expire= Number(new Date(String(body["expire"])))
    const medicine_Amount= Number(body["medicine_Amount"]);
    const manufacture= String(body["manufacture"]);
    const addedBy= Number(body["addedBy"]);
    const category= String(body["category"]);
    const description= String(body["description"]);
    const price= Number(body["price"]);
    const sectionId= Number(body["section"]);
    const image= body["image"];
     let url=""
    if(image instanceof File){
      const arraybuffer=await image.arrayBuffer()
       const buffer=await Buffer.from(arraybuffer)
       const filepath=`./public/uplods/${image.name}`
        await fs.promises.writeFile(filepath,buffer)
       url=`/uplods/${image.name}`
    }
       const checked = await check_data(medicine_name, expire, medicine_Amount, manufacture, addedBy, category, description, price, sectionId)
        if (checked.flag == false)
        return c.json({error: checked.message}, 400)
        const [updated] = await db.update(medicine).set({
        medicine_name, expire, medicine_Amount, manufacture,
      addedBy, category, description, price, section: sectionId,...(url? { image: url } : {})
       }).where(eq(medicine.id, id)).returning()
       if (!updated)
         return c.json({error: "medicine not found"}, 404)
       return c.json({message: "medicine updated successfully", medicine: updated})
    } catch(error) {
      
      return c.json({error: "error updating medicine"}, 500)
    }
})

async function check_data(medicine_name: string, expire: number, medicine_Amount: number, manufacture: string, addedBy: number, category: string, description: string, price: number, section: number) {
    if (price<=250||!price)
      return {flag: false, message: "price value should be more than 250 Dinar or its not exist"}
    if (!medicine_name || medicine_name.trim() === "")
      return {flag: false, message: "error in name or name is empty"}
    if (new Date(expire).getTime() <= Date.now() || !expire)
      return {flag: false, message: "expire is ended or invalid"}
    if (medicine_Amount <= 0)
      return {flag: false, message: "medicine amount must be greater than 0"}
    if (!manufacture || manufacture.trim() === "")
      return {flag: false, message: "error in manufacture or manufacture is empty"}
    if (!description || description.trim() === "")
      return {flag: false, message: "error in description or description is empty"}
    if (!category || category.trim() === "")
      return {flag: false, message: "error in category or category is empty"}
    if (!addedBy)
      return {flag: false, message: "error in addedBy"}
    if (!section)
      return {flag: false, message: "should put it on section"}
    return {flag: true, message: "success check of data"}
}

export default app