import {
  index,
  integer,
  serial,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/pg-core";
import { babdiaSchema } from "./base-schema";
import { restaurants } from "./restaurant.schema";
import { user } from "./auth.schema";

// ── 후기 ──
export const reviews = babdiaSchema.table(
  "reviews",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    uuid: varchar("uuid", { length: 36 }).notNull().unique(),
    rating: integer("rating").notNull(),
    content: text("content"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("reviews_restaurant_id_idx").on(t.restaurantId),
    index("reviews_user_id_idx").on(t.userId),
  ],
);
