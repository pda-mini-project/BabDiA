import { relations } from "drizzle-orm";

export { babdiaSchema } from "./base-schema";
export { user, session, account, verification } from "./auth.schema";
export { restaurants } from "./restaurant.schema";
export { reviews } from "./review.schema";
export {
  tagCategories,
  tags,
  restaurantTags,
} from "./tag.schema";

import { user, session, account } from "./auth.schema";
import { restaurants } from "./restaurant.schema";
import { reviews } from "./review.schema";
import {
  tagCategories,
  tags,
  restaurantTags,
} from "./tag.schema";

// ── Relations (순환 참조 방지를 위해 index에서 정의) ──
export const userRelations = relations(user, ({ many }) => ({
  reviews: many(reviews),
  sessions: many(session),
  accounts: many(account),
}));


export const restaurantsRelations = relations(restaurants, ({ many }) => ({
  reviews: many(reviews),
  restaurantTags: many(restaurantTags),
}));

export const reviewsRelations = relations(reviews, ({ one }) => ({
  restaurant: one(restaurants),
  user: one(user),
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
