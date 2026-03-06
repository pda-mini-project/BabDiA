import {
  date,
  index,
  integer,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { babdiaSchema } from "./base-schema";
import { user } from "./auth.schema";
import { restaurants } from "./restaurant.schema";

export const dailyRestaurantSelections = babdiaSchema.table(
  "daily_restaurant_selection",
  {
    id: serial("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    restaurantId: integer("restaurant_id")
      .notNull()
      .references(() => restaurants.id, { onDelete: "cascade" }),
    selectedDate: date("selected_date").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at")
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (t) => [
    uniqueIndex("daily_restaurant_selection_user_date_uk").on(
      t.userId,
      t.selectedDate,
    ),
    index("daily_restaurant_selection_date_restaurant_idx").on(
      t.selectedDate,
      t.restaurantId,
    ),
    index("daily_restaurant_selection_user_idx").on(t.userId),
    index("daily_restaurant_selection_restaurant_idx").on(t.restaurantId),
  ],
);
