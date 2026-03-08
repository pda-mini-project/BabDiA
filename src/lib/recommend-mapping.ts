/**
 * 점메추 화면 필터 태그 → DB 조건 매핑
 * (restaurants/new에서 저장한 태그: 국물, 밥, 면, 혼밥가능, 웨이팅X, 매움, 신호등X)
 *
 * 동작 원칙:
 * - 필터를 고르지 않음 → 해당 차원은 조건 없음(전부 후보). 예: 맵기 미선택 시 매운/안 매운 모두 후보.
 * - "있어도 됨"(웨이팅) → 웨이팅 유무 상관없이 전부 후보.
 * - "신호등_상관없음" → 신호등 있음/없음 전부 후보.
 * - "거리_상관없음" / "가격_상관없음" → 도보·가격 조건 없음.
 */

export type RecommendFilterCondition = {
  /** 반드시 가지고 있어야 하는 태그 이름 (DB tags.name) - AND */
  requireTags: string[];
  /** 그룹별로 하나라도 있으면 됨 (OR) - 예: 국물 있는 = 국물있음 OR 국물둘다 */
  requireAnyOf: string[][];
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
  매운: "매움",
  가능: "혼밥가능", // 혼밥 필터
  "없을 선호": "웨이팅X",
  "없어야 함": "신호등X",
};

/** 국물: 있음/없음 선택 시 (둘 다 있는 식당도 포함). "국물"은 예전 태그명 → 국물 있는으로 인정 */
const SOUP_REQUIRE_ANY: Record<string, string[]> = {
  "국물 있는": ["국물있음", "국물둘다", "국물"],
  "국물 없는": ["국물없음", "국물둘다"],
};

const TAG_EXCLUDE: Record<string, string> = {
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
  const requireAnyOf: string[][] = [];
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
    if (SOUP_REQUIRE_ANY[tag]) {
      const group = SOUP_REQUIRE_ANY[tag];
      if (!requireAnyOf.some((g) => g.length === group.length && g.every((x, i) => x === group[i]))) {
        requireAnyOf.push(group);
      }
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

  // "상관없음" / "있어도 됨" → 해당 차원은 필터 없음 (전부 후보)
  const hasWaitingOk = tagStrings.some((t) => t?.trim() === "있어도 됨");
  const hasCrosswalkAny = tagStrings.some((t) => t?.trim() === "신호등_상관없음");
  const hasDistanceAny = tagStrings.some((t) => t?.trim() === "거리_상관없음");
  const hasPriceAny = tagStrings.some((t) => t?.trim() === "가격_상관없음");
  const hasCategoryAny = tagStrings.some((t) => t?.trim() === "음식종류_상관없음");

  if (hasCategoryAny) category = null;

  if (hasWaitingOk) {
    const idx = requireTags.indexOf("웨이팅X");
    if (idx !== -1) requireTags.splice(idx, 1);
  }
  if (hasCrosswalkAny) {
    const idx = requireTags.indexOf("신호등X");
    if (idx !== -1) requireTags.splice(idx, 1);
  }
  if (hasDistanceAny) maxWalkingMinutes = null;
  if (hasPriceAny) priceRange = null;

  return {
    requireTags,
    requireAnyOf,
    excludeTags,
    priceRange,
    maxWalkingMinutes,
    category,
  };
}
