import { db } from "@/server/db/config/db_config";
import { medicine } from "@/server/db/schema/medicines";
import { Hono } from "hono";
import { eq } from "drizzle-orm";
import { isadmin } from "@/server/auth/action";
import { section } from "@/server/db/schema";


const app = new Hono()
  .post("/creat_section", async (c) => {
    const check = await isadmin();
    if (check == false) return c.json({error:"request denied, you are not admin"}, 403);
    const data = await c.req.json();
    const { name, description } = data;
    if (!name || name.trim() == "") return c.json({error:"section name is required"}, 400);
    if (!description || description.trim() == "")
      return c.json({error:"section description is required"}, 400);
    try {
      const [creat_section] = await db
        .insert(section)
        .values({ description: description, name: name })
        .returning();
      if (!creat_section) return c.json({error:"failed to create section"}, 500);
      return c.json({ message: "section created successfully", section: creat_section });
    } catch (error) {
      //return c.json({ error: "creat section error" }, 500);
      return c.json(error)
    }
  })
  .get("/get_sections", async (c) => {
    try {
      const sections = await db
        .select({ sectionid: section.sectionid, name: section.name, description: section.description })
        .from(section);
      return c.json(sections);
    } catch {
      return c.json({error:"error fetching sections"}, 500);
    }
  })
  .get("/:id", async (c) => {
    const idprams = c.req.param("id");
    const id = Number(idprams);
    if (!id) return c.json({error:"invalid section id"}, 400);
    try {
      const section_content = await db
        .select()
        .from(medicine)
        .where(eq(medicine.section, id));
      return c.json(section_content);
    } catch {
      return c.json({error:"error fetching section"}, 500);
    }
  })
  .put("/:id", async (c) => {
    const check = await isadmin();
    if (check == false) return c.json({error:"request denied, you are not admin"}, 403);
    const idpram = c.req.param("id");
    const id = Number(idpram);
    const data = await c.req.json();
    const { name, description } = data;
    if (!name || name.trim() == "") return c.json({error:"name should not be empty"}, 400);

    if (!description || description.trim() == "")
      return c.json({error:"description should not be empty"}, 400);
    try {
      const update = await db
        .update(section)
        .set({ name: name, description: description })
        .where(eq(section.sectionid, id));
      if (!update) return c.json({error:"section not found"}, 400);
      return c.json({message:"section updated successfully"});
    } catch {
      return c.json({ error: "error in section update" }, 500);
    }
  })
  .delete("/:id",async(c)=>{
    const check = await isadmin();
    if (check == false) return c.json({error:"request denied, you are not admin"}, 403);
    const id=Number(c.req.param('id'))
    if(!id) return c.json({error:"invalid section id"}, 400)
    try{
      const orphanedMedicines = await db.update(medicine).set({section:null}).where(eq(medicine.section,id)).returning()
      const [deleted] = await db.delete(section).where(eq(section.sectionid,id)).returning()
      if(!deleted) return c.json({error:"section not found"}, 404)
      return c.json({message:"section deleted successfully", medicinesWithoutSection: orphanedMedicines})
    }
    catch{
      return c.json({error:"delete section error"},500)
    }
  })
export default app;