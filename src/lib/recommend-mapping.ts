/**
 * 점메추 화면 필터 태그 → DB 조건 매핑
 * (restaurants/new에서 저장한 태그: 국물, 밥, 면, 혼밥가능, 웨이팅X, 매움, 횡단보도X)
 */

export type RecommendFilterCondition = {
  /** 반드시 가지고 있어야 하는 태그 이름 (DB tags.name) */
  requireTags: string[];
  /** 가지고 있으면 안 되는 태그 이름 */
  excludeTags: string[];
  /** price_range 일치 (하나만) */
  priceRange: string | null;
  /** 도보 분 이하 (null이면 조건 없음) */
  maxWalkingMinutes: number | null;
  /** 분류(음식 종류) - DB restaurants.category 값 (한식, 중식, 일식, 양식, 샌드위치/햄버거) */
  category: string | null;
};

const TAG_REQUIRE: Record<string, string> = {
  밥: "밥",
  면: "면",
  "국물 있는": "국물",
  매운: "매움",
  가능: "혼밥가능", // 혼밥 필터
  "없을 선호": "웨이팅X",
  "없어야 함": "횡단보도X",
};

const TAG_EXCLUDE: Record<string, string> = {
  "국물 없는": "국물",
  "안 매운": "매움",
  불가: "혼밥가능",
};

const PRICE_TAGS = [
  "10,000원 이하",
  "13,000원 이하",
  "13,000원 초과",
] as const;

const WALKING_TAGS: Record<string, number> = {
  "도보 5분": 5,
  "도보 10분": 10,
};

/** 점메추 필터 '음식 종류' 태그 → DB restaurants.category 값 (폼에서 저장하는 값과 동일) */
const CATEGORY_TAGS: Record<string, string> = {
  한식: "한식",
  중식: "중식",
  일식: "일식",
  양식: "양식",
  "햄버거/샌드위치": "샌드위치/햄버거",
};

export function parseRecommendTags(tagStrings: string[]): RecommendFilterCondition {
  const requireTags: string[] = [];
  const excludeTags: string[] = [];
  let priceRange: string | null = null;
  let maxWalkingMinutes: number | null = null;
  let category: string | null = null;

  for (const t of tagStrings) {
    const tag = t?.trim();
    if (!tag) continue;

    if (CATEGORY_TAGS[tag]) {
      category = CATEGORY_TAGS[tag];
    }
    if (TAG_REQUIRE[tag]) {
      const dbTag = TAG_REQUIRE[tag];
      if (!requireTags.includes(dbTag)) requireTags.push(dbTag);
    }
    if (TAG_EXCLUDE[tag]) {
      const dbTag = TAG_EXCLUDE[tag];
      if (!excludeTags.includes(dbTag)) excludeTags.push(dbTag);
    }
    if (PRICE_TAGS.includes(tag as (typeof PRICE_TAGS)[number])) {
      priceRange = tag;
    }
    if (WALKING_TAGS[tag] != null) {
      const min = WALKING_TAGS[tag];
      if (maxWalkingMinutes == null || min < maxWalkingMinutes) {
        maxWalkingMinutes = min;
      }
    }
  }

  return {
    requireTags,
    excludeTags,
    priceRange,
    maxWalkingMinutes,
    category,
  };
}
