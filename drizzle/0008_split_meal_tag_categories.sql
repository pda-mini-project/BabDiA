-- 태그 카테고리 분리: 밥/면(meal) -> 밥(rice), 면(noodle)
INSERT INTO "babdia"."tag_categories" ("name", "code")
VALUES
  ('밥', 'rice'),
  ('면', 'noodle')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
-- 기존 태그를 새 카테고리로 이동
UPDATE "babdia"."tags" t
SET tag_category_id = (
  SELECT id FROM "babdia"."tag_categories" WHERE code = 'rice' LIMIT 1
)
WHERE t.name = '밥';
--> statement-breakpoint
UPDATE "babdia"."tags" t
SET tag_category_id = (
  SELECT id FROM "babdia"."tag_categories" WHERE code = 'noodle' LIMIT 1
)
WHERE t.name = '면';
--> statement-breakpoint
-- 더 이상 참조되지 않는 legacy 카테고리 정리
DELETE FROM "babdia"."tag_categories" c
WHERE c.code = 'meal'
  AND NOT EXISTS (
    SELECT 1
    FROM "babdia"."tags" t
    WHERE t.tag_category_id = c.id
  );
