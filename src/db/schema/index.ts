import { relations } from "drizzle-orm";

export { babdiaSchema } from "./base-schema";
export { users } from "./auth.schema";
export { restaurants } from "./restaurant.schema";
export { reviews } from "./review.schema";
export {
  tagCategories,
  tags,
  restaurantTags,
} from "./tag.schema";

import { users } from "./auth.schema";
import { restaurants } from "./restaurant.schema";
import { reviews } from "./review.schema";
import {
  tagCategories,
  tags,
  restaurantTags,
} from "./tag.schema";

// ── Relations (순환 참조 방지를 위해 index에서 정의) ──
export const usersRelations = relations(users, ({ many }) => ({
  reviews: many(reviews),
}));

export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  reviews: many(reviews),
  restaurantTags: many(restaurantTags),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  restaurant: one(restaurants),
  user: one(users),
}));

export const tagCategoriesRelations = relations(tagCategories, ({ many }) => ({
  tags: many(tags),
}));

export const tagsRelations = relations(tags, ({ one, many }) => ({
  tagCategory: one(tagCategories),
  restaurantTags: many(restaurantTags),
}));

export const restaurantTagsRelations = relations(restaurantTags, ({ one }) => ({
  restaurant: one(restaurants),
  tag: one(tags),
}));
