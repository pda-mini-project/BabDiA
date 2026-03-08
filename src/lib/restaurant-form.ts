/**
 * 식당 추가 폼: 점메추와 같은 카테고리 구성, 카테고리별 1개 필수 선택 (밥/면은 밥 | 면 | 둘 다 중 하나)
 */
export const CATEGORIES = [
  { value: "한식", label: "한식" },
  { value: "중식", label: "중식" },
  { value: "일식", label: "일식" },
  { value: "양식", label: "양식" },
  { value: "샌드위치/햄버거", label: "샌드위치/햄버거" },
  { value: "기타", label: "기타" },
] as const;

export const PRICE_RANGES = [
  { value: "10,000원 이하", label: "10,000원 이하" },
  { value: "13,000원 이하", label: "13,000원 이하" },
  { value: "13,000원 초과", label: "13,000원 초과" },
] as const;

/** 국물: 하나만 선택 (필수) */
export const SOUP_TAG_OPTIONS = [
  { value: "국물있음", label: "국물 있는" },
  { value: "국물없음", label: "국물 없는" },
  { value: "국물둘다", label: "둘 다" },
] as const;

/** 거리: 하나만 선택 (필수). 도보 10분 초과 = walkingMinutes null, 점메추에서는 거리_상관없음 선택 시에만 노출 */
export const WALK_OPTIONS = [
  { value: "5", label: "도보 5분" },
  { value: "10", label: "도보 10분" },
  { value: "over10", label: "도보 10분 초과" },
] as const;

/** 밥/면: 하나만 선택 (필수). 국물처럼 밥 / 면 / 둘 다 */
export const MEAL_OPTIONS = [
  { value: "밥", label: "밥" },
  { value: "면", label: "면" },
  { value: "밥면", label: "둘 다" },
] as const;

/** 신호등: 하나만 선택 (필수) */
export const TRAFFIC_LIGHT_OPTIONS = [
  { value: "none", label: "없음", tag: "신호등X" as const },
  { value: "yes", label: "있음", tag: null },
] as const;

/** 맵기: 하나만 선택 (필수) */
export const SPICY_OPTIONS = [
  { value: "매운", label: "매운", tag: "매움" as const },
  { value: "안 매운", label: "안 매운", tag: "안 매운" as const },
] as const;

/** 혼밥: 하나만 선택 (필수) */
export const SOLO_OPTIONS = [
  { value: "가능", label: "가능", tag: "혼밥가능" as const },
  { value: "불가", label: "불가", tag: "불가" as const },
] as const;

/** 웨이팅: 하나만 선택 (필수) */
export const WAITING_OPTIONS = [
  { value: "없을 선호", label: "없을 선호", tag: "웨이팅X" as const },
  { value: "있어도 됨", label: "있어도 됨", tag: "있어도 됨" as const },
] as const;

export type SoupOption = (typeof SOUP_TAG_OPTIONS)[number]["value"];
export type WalkOption = (typeof WALK_OPTIONS)[number]["value"];
export type MealOption = (typeof MEAL_OPTIONS)[number]["value"];
export type TrafficLightOption = (typeof TRAFFIC_LIGHT_OPTIONS)[number]["value"];
export type SpicyOption = (typeof SPICY_OPTIONS)[number]["value"];
export type SoloOption = (typeof SOLO_OPTIONS)[number]["value"];
export type WaitingOption = (typeof WAITING_OPTIONS)[number]["value"];

export type AddRestaurantFormState = {
  name: string;
  category: string;
  priceRange: string;
  /** 거리: 도보 5분 | 10분 | 10분 초과 (필수) */
  walkOption: WalkOption;
  naverLink: string;
  /** 국물: 있음/없음/둘 다 중 하나 (필수) */
  soupOption: SoupOption;
  /** 밥/면: 밥 | 면 | 둘 다 중 하나 (필수) */
  mealOption: MealOption;
  /** 신호등: 없음 | 있음 (필수) */
  trafficLight: TrafficLightOption;
  /** 맵기: 매운 | 안 매운 (필수) */
  spicyOption: SpicyOption;
  /** 혼밥: 가능 | 불가 (필수) */
  soloOption: SoloOption;
  /** 웨이팅: 없을 선호 | 있어도 됨 (필수) */
  waitingOption: WaitingOption;
  recommendMenu: string;
  locationText: string;
};

export function getInitialFormState(): AddRestaurantFormState {
  return {
    name: "",
    category: CATEGORIES[0].value,
    priceRange: PRICE_RANGES[0].value,
    walkOption: WALK_OPTIONS[0].value,
    naverLink: "",
    soupOption: SOUP_TAG_OPTIONS[0].value,
    mealOption: MEAL_OPTIONS[0].value,
    trafficLight: TRAFFIC_LIGHT_OPTIONS[0].value,
    spicyOption: SPICY_OPTIONS[0].value,
    soloOption: SOLO_OPTIONS[0].value,
    waitingOption: WAITING_OPTIONS[0].value,
    recommendMenu: "",
    locationText: "",
  };
}

/** API 전송용: selectedTags 배열 + walkingMinutes (over10이면 빈 문자열 → DB null) */
export function buildSubmitPayload(form: AddRestaurantFormState): {
  name: string;
  category: string;
  priceRange: string;
  walkMinutes: string;
  naverLink: string;
  selectedTags: string[];
  recommendMenu: string;
  locationText: string;
} {
  const walkTag =
    form.walkOption === "over10" ? "도보 10분 초과" : `도보 ${form.walkOption}분`;
  const mealTags =
    form.mealOption === "밥면" ? ["밥", "면"] : [form.mealOption];
  const tags: string[] = [
    form.soupOption,
    walkTag,
    ...mealTags,
    form.priceRange,
  ];
  const trafficTag = TRAFFIC_LIGHT_OPTIONS.find((o) => o.value === form.trafficLight)?.tag;
  if (trafficTag) tags.push(trafficTag);
  const spicyTag = SPICY_OPTIONS.find((o) => o.value === form.spicyOption)?.tag;
  if (spicyTag) tags.push(spicyTag);
  const soloTag = SOLO_OPTIONS.find((o) => o.value === form.soloOption)?.tag;
  if (soloTag) tags.push(soloTag);
  const waitingTag = WAITING_OPTIONS.find((o) => o.value === form.waitingOption)?.tag;
  if (waitingTag) tags.push(waitingTag);

  return {
    name: form.name,
    category: form.category,
    priceRange: form.priceRange,
    walkMinutes: form.walkOption === "over10" ? "" : form.walkOption,
    naverLink: form.naverLink,
    selectedTags: tags,
    recommendMenu: form.recommendMenu,
    locationText: form.locationText,
  };
}

export const initialFormState = getInitialFormState();
