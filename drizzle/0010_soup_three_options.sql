-- 국물: 단일 태그 → 세 가지 선택 (국물있음 / 국물없음 / 국물둘다)
-- 1) 새 태그 3개 추가 (soup 카테고리, 없을 때만)
INSERT INTO "babdia"."tags" ("name", "tag_category_id")
SELECT '국물있음', c.id FROM "babdia"."tag_categories" c WHERE c.code = 'soup'
  AND NOT EXISTS (SELECT 1 FROM "babdia"."tags" t WHERE t.name = '국물있음' AND t.tag_category_id = c.id)
LIMIT 1;
INSERT INTO "babdia"."tags" ("name", "tag_category_id")
SELECT '국물없음', c.id FROM "babdia"."tag_categories" c WHERE c.code = 'soup'
  AND NOT EXISTS (SELECT 1 FROM "babdia"."tags" t WHERE t.name = '국물없음' AND t.tag_category_id = c.id)
LIMIT 1;
INSERT INTO "babdia"."tags" ("name", "tag_category_id")
SELECT '국물둘다', c.id FROM "babdia"."tag_categories" c WHERE c.code = 'soup'
  AND NOT EXISTS (SELECT 1 FROM "babdia"."tags" t WHERE t.name = '국물둘다' AND t.tag_category_id = c.id)
LIMIT 1;

-- 2) 기존 '국물' 태그를 가진 식당 → '국물있음'으로 변경
UPDATE "babdia"."restaurant_tags" rt
SET tag_id = (SELECT t2.id FROM "babdia"."tags" t2 WHERE t2.name = '국물있음' LIMIT 1)
FROM "babdia"."tags" t
WHERE rt.tag_id = t.id
  AND t.name = '국물';

-- 3) 사용처 없어진 '국물' 태그 삭제 (선택)
DELETE FROM "babdia"."tags"
WHERE name = '국물'
  AND tag_category_id = (SELECT id FROM "babdia"."tag_categories" WHERE code = 'soup' LIMIT 1)
  AND NOT EXISTS (SELECT 1 FROM "babdia"."restaurant_tags" WHERE tag_id = "babdia"."tags".id);
