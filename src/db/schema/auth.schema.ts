import { serial, timestamp, varchar } from "drizzle-orm/pg-core";
import { babdiaSchema } from "./base-schema";

// ── 유저 ──
export const users = babdiaSchema.table("users", {
  id: serial("id").primaryKey(),
  loginId: varchar("login_id", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  nickname: varchar("nickname", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
