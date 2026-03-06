-- 횡단보도 → 신호등 문구 변경 (카테고리명·태그명)
UPDATE "babdia"."tag_categories"
SET name = '신호등'
WHERE code = 'crosswalk';

UPDATE "babdia"."tags"
SET name = '신호등X'
WHERE name = '횡단보도X';
