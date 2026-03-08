/**
 * 태그 카테고리: 거리, 국물, 밥, 면, 음식 종류, 가격, 신호등, 맵기, 혼밥, 웨이팅
 * 식당 추가·점메추 API에서 공통 사용
 */

export const TAG_CATEGORY_CODES = [
  "distance",
  "soup",
  "rice",
  "noodle",
  "cuisine",
  "price",
  "crosswalk",
  "spicy",
  "solo",
  "waiting",
] as const;

export type TagCategoryCode = (typeof TAG_CATEGORY_CODES)[number];

/** DB/폼에 저장되는 태그 이름 → 카테고리 code */
export const TAG_NAME_TO_CATEGORY_CODE: Record<string, TagCategoryCode> = {
  // 거리
  "도보 5분": "distance",
  "도보 10분": "distance",
  "도보 10분 초과": "distance",
  상관없음: "distance",
  // 국물 (있음/없음/둘 다 중 하나)
  국물있음: "soup",
  국물없음: "soup",
  국물둘다: "soup",
  // 밥/면
  밥: "rice",
  면: "noodle",
  // 음식 종류
  한식: "cuisine",
  중식: "cuisine",
  일식: "cuisine",
  양식: "cuisine",
  "샌드위치/햄버거": "cuisine",
  "햄버거/샌드위치": "cuisine",
  기타: "cuisine",
  // 가격
  "10,000원 이하": "price",
  "13,000원 이하": "price",
  "13,000원 초과": "price",
  // 신호등
  신호등X: "crosswalk",
  "없어야 함": "crosswalk",
  // 맵기
  매움: "spicy",
  매운: "spicy",
  "안 매운": "spicy",
  // 혼밥
  혼밥가능: "solo",
  가능: "solo",
  불가: "solo",
  // 웨이팅
  웨이팅X: "waiting",
  "없을 선호": "waiting",
  "있어도 됨": "waiting",
};

export function getCategoryCodeForTagName(tagName: string): TagCategoryCode | undefined {
  const trimmed = tagName?.trim();
  return trimmed ? TAG_NAME_TO_CATEGORY_CODE[trimmed] : undefined;
}

/** 마이그레이션/시드용: (name, code) 목록 */
export const TAG_CATEGORIES_SEED: { name: string; code: TagCategoryCode }[] = [
  { name: "거리", code: "distance" },
  { name: "국물", code: "soup" },
  { name: "밥", code: "rice" },
  { name: "면", code: "noodle" },
  { name: "음식 종류", code: "cuisine" },
  { name: "가격", code: "price" },
  { name: "신호등", code: "crosswalk" },
  { name: "맵기", code: "spicy" },
  { name: "혼밥", code: "solo" },
  { name: "웨이팅", code: "waiting" },
];
