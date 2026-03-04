import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

/**
 * DATABASE_URL 환경 변수 사용 (Supabase 등 PostgreSQL)
 * 사용: pnpm add pg @types/pg drizzle-orm
 */
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle(pool, { schema });
