import honoApp from "@/server/api/root";
import { handle } from "hono/vercel";

export const GET = handle(honoApp);
export const POST = handle(honoApp);
export const PUT = handle(honoApp);
export const DELETE = handle(honoApp);
export const PATCH = handle(honoApp);
export const OPTIONS = handle(honoApp);
