import { Hono } from "hono";
import { signin, signUp, logout } from "@/server/auth/action";
import { get_user } from "@/lib/auth/session";
import { db } from "@/server/db/config/db_config";
import { users } from "@/server/db/schema";
import { eq } from "drizzle-orm";

const authRoutes = new Hono();

// GET /api/auth/me - get current logged in user
authRoutes.get("/me", async (c) => {
  try {
    const sessionData = await get_user();
    if (!sessionData || sessionData.length === 0) {
      return c.json({ error: "not authenticated" }, 401);
    }
    const [user] = await db.select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
    }).from(users).where(eq(users.id, sessionData[0].userid));
    if (!user) {
      return c.json({ error: "user not found" }, 404);
    }
    return c.json(user);
  } catch {
    return c.json({ error: "Internal server error" }, 500);
  }
});

authRoutes.post("/signin", async (c) => {
  try {
    const { email, password } = await c.req.json();
    
    if (!email || !password) {
      return c.json({ error: "Email and password are required" }, 400);
    }
    
    const result = await signin(email, password);
    
    if (result === "user sucsses") {
      return c.json({ message: "Sign in successful" }, 200);
    } else {
      return c.json({ error: result }, 401);
    }
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});


authRoutes.post("/signup", async (c) => {
  try {
    const { email, password, name, role } = await c.req.json();
    
    if (!email || !password || !name) {
      return c.json({ error: "Email, password, and name are required" }, 400);
    }
    
    const result = await signUp({ email, password, name, role });
    
    if (result === "signup success") {
      return c.json({ message: "Sign up successful" }, 201);
    } else {
      return c.json({ error: result }, 400);
    }
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});


authRoutes.post("/logout", async (c) => {
  try {
    const result = await logout();
    
    if (result === "sign out is sucsses") {
      return c.json({ message: "Logout successful" }, 200);
    } else {
      return c.json({ error: result }, 400);
    }
  } catch (error) {
    return c.json({ error: "Internal server error" }, 500);
  }
});

export default authRoutes;
