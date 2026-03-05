-- 기존 가격대 값을 새 옵션으로 매핑 (restaurants/new 폼 변경 반영)
UPDATE "babdia"."restaurants" SET "price_range" = '10,000원 이하' WHERE "price_range" = '~ 8,000원';
--> statement-breakpoint
UPDATE "babdia"."restaurants" SET "price_range" = '13,000원 이하' WHERE "price_range" = '8,000 ~ 12,000원';
--> statement-breakpoint
UPDATE "babdia"."restaurants" SET "price_range" = '13,000원 초과' WHERE "price_range" = '12,000원 이상';
