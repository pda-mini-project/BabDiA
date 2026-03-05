-- 9개 태그 카테고리: 거리, 국물, 밥/면, 음식 종류, 가격, 횡단보도, 맵기, 혼밥, 웨이팅
INSERT INTO "babdia"."tag_categories" ("name", "code")
VALUES
  ('거리', 'distance'),
  ('국물', 'soup'),
  ('밥/면', 'meal'),
  ('음식 종류', 'cuisine'),
  ('가격', 'price'),
  ('횡단보도', 'crosswalk'),
  ('맵기', 'spicy'),
  ('혼밥', 'solo'),
  ('웨이팅', 'waiting')
ON CONFLICT ("code") DO NOTHING;
--> statement-breakpoint
-- 기존 tags의 tag_category_id를 이름 기준으로 새 카테고리로 변경
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'soup' LIMIT 1) WHERE t.name = '국물';
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'meal' LIMIT 1) WHERE t.name IN ('밥', '면');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'cuisine' LIMIT 1) WHERE t.name IN ('한식', '중식', '일식', '양식', '샌드위치/햄버거', '햄버거/샌드위치', '기타');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'price' LIMIT 1) WHERE t.name IN ('10,000원 이하', '13,000원 이하', '13,000원 초과');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'crosswalk' LIMIT 1) WHERE t.name IN ('횡단보도X', '없어야 함');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'spicy' LIMIT 1) WHERE t.name IN ('매움', '매운', '안 매운');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'solo' LIMIT 1) WHERE t.name IN ('혼밥가능', '가능', '불가');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'waiting' LIMIT 1) WHERE t.name IN ('웨이팅X', '없을 선호', '있어도 됨');
--> statement-breakpoint
UPDATE "babdia"."tags" t SET tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'distance' LIMIT 1) WHERE t.name IN ('도보 5분', '도보 10분', '상관없음');
