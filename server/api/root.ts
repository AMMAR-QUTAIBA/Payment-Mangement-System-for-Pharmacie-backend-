import { Hono } from "hono";
import { hc } from "hono/client";
import index from "./pharmacy/index";
import medicine from "./pharmacy/medicine";
import authRoutes from "./auth/route";
import bills from "./pharmacy/bills";
import section from "./pharmacy/section";
import { env } from "process";
const honoApp = new Hono()
  .basePath("/api")
  .route("/", index)
  .route("/medicine", medicine)
  .route("/auth", authRoutes)
  .route("/bills", bills)
  .route("/section", section);

export default honoApp;
type HonoAppType = typeof honoApp;

export const api = hc<HonoAppType>(
  env.NEXT_PUBLIC_API_URL as string
).api;

