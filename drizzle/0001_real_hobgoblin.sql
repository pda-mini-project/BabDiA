CREATE SCHEMA IF NOT EXISTS "babdia";
--> statement-breakpoint
CREATE TABLE "babdia"."users" (
	"id" serial PRIMARY KEY NOT NULL,
	"login_id" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"nickname" varchar(255) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "babdia"."restaurant_tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"tag_id" integer NOT NULL,
	CONSTRAINT "restaurant_tags_restaurant_id_tag_id_key" UNIQUE("restaurant_id","tag_id")
);
--> statement-breakpoint
CREATE TABLE "babdia"."restaurants" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"image_url" text,
	"naver_link" text,
	"recommend_menu" varchar(500),
	"location_text" text,
	"price_range" varchar(100),
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "babdia"."reviews" (
	"id" serial PRIMARY KEY NOT NULL,
	"restaurant_id" integer NOT NULL,
	"user_id" integer NOT NULL,
	"uuid" varchar(36) NOT NULL,
	"rating" integer NOT NULL,
	"content" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reviews_uuid_unique" UNIQUE("uuid")
);
--> statement-breakpoint
CREATE TABLE "babdia"."tag_categories" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"code" varchar(100) NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "tag_categories_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "babdia"."tags" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"group_name" varchar(255),
	"tag_category_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP TABLE IF EXISTS "users" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "restaurant_tags" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "restaurants" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "reviews" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "tag_categories" CASCADE;--> statement-breakpoint
DROP TABLE IF EXISTS "tags" CASCADE;--> statement-breakpoint
ALTER TABLE "babdia"."restaurant_tags" ADD CONSTRAINT "restaurant_tags_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "babdia"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babdia"."restaurant_tags" ADD CONSTRAINT "restaurant_tags_tag_id_tags_id_fk" FOREIGN KEY ("tag_id") REFERENCES "babdia"."tags"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babdia"."reviews" ADD CONSTRAINT "reviews_restaurant_id_restaurants_id_fk" FOREIGN KEY ("restaurant_id") REFERENCES "babdia"."restaurants"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babdia"."reviews" ADD CONSTRAINT "reviews_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "babdia"."users"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "babdia"."tags" ADD CONSTRAINT "tags_tag_category_id_tag_categories_id_fk" FOREIGN KEY ("tag_category_id") REFERENCES "babdia"."tag_categories"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "restaurant_tags_restaurant_id_idx" ON "babdia"."restaurant_tags" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "restaurant_tags_tag_id_idx" ON "babdia"."restaurant_tags" USING btree ("tag_id");--> statement-breakpoint
CREATE INDEX "reviews_restaurant_id_idx" ON "babdia"."reviews" USING btree ("restaurant_id");--> statement-breakpoint
CREATE INDEX "reviews_user_id_idx" ON "babdia"."reviews" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "tags_tag_category_id_idx" ON "babdia"."tags" USING btree ("tag_category_id");