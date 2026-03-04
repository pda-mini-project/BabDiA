import {
  index,
  integer,
  serial,
  timestamp,
  unique,
  varchar,
} from "drizzle-orm/pg-core";
import { babdiaSchema } from "./base-schema";
import { restaurants } from "./restaurant.schema";

// ── 태그 카테고리 ──
export const tagCategories = babdiaSchema.table("tag_categories", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  code: varchar("code", { length: 100 }).notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// ── 태그 ──
export const tags = babdiaSchema.table(
  "tags",
  {
    id: serial("id").primaryKey(),
    name: varchar("name", { length: 255 }).notNull(),
    groupName: varchar("group_name", { length: 255 }),
    tagCategoryId: integer("tag_category_id")
      .notNull()
      .references(() => tagCategories.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [index("tags_tag_category_id_idx").on(t.tagCategoryId)],
);

// ── 식당-태그 (다대다) ──
export const restaurantTags = babdiaSchema.table(
  "restaurant_tags",
  {
    id: serial("id").primaryKey(),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    tagId: integer("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (t) => [
    unique("restaurant_tags_restaurant_id_tag_id_key").on(
      t.restaurantId,
      t.tagId,
    ),
    index("restaurant_tags_restaurant_id_idx").on(t.restaurantId),
    index("restaurant_tags_tag_id_idx").on(t.tagId),
  ],
);
