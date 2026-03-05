import {
  integer,
  numeric,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { babdiaSchema } from "./base-schema";

// ── 식당 ──
export const restaurants = babdiaSchema.table("restaurants", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  imageUrl: text("image_url"),
  naverLink: text("naver_link"),
  recommendMenu: varchar("recommend_menu", { length: 500 }),
  locationText: text("location_text"),
  priceRange: varchar("price_range", { length: 100 }),
  rating: numeric("rating", { precision: 2, scale: 1 }),
  walkingMinutes: integer("walking_minutes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
