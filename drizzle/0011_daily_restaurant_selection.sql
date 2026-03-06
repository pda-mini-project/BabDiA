CREATE TABLE IF NOT EXISTS "babdia"."daily_restaurant_selection" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"restaurant_id" integer NOT NULL,
	"selected_date" date NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "babdia"."daily_restaurant_selection"
ADD CONSTRAINT "daily_restaurant_selection_user_id_user_id_fk"
FOREIGN KEY ("user_id") REFERENCES "babdia"."user"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "babdia"."daily_restaurant_selection"
ADD CONSTRAINT "daily_restaurant_selection_restaurant_id_restaurants_id_fk"
FOREIGN KEY ("restaurant_id") REFERENCES "babdia"."restaurants"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "daily_restaurant_selection_user_date_uk"
ON "babdia"."daily_restaurant_selection" USING btree ("user_id","selected_date");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_restaurant_selection_date_restaurant_idx"
ON "babdia"."daily_restaurant_selection" USING btree ("selected_date","restaurant_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_restaurant_selection_user_idx"
ON "babdia"."daily_restaurant_selection" USING btree ("user_id");
--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "daily_restaurant_selection_restaurant_idx"
ON "babdia"."daily_restaurant_selection" USING btree ("restaurant_id");
