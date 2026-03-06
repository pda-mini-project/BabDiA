/**
 * 식당 추가 폼 옵션 (이미지 기준)
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

/** 국물: 하나만 선택 (국물있음 / 국물없음 / 국물둘다) */
export const SOUP_TAG_OPTIONS = [
  { value: "국물있음", label: "국물 있는" },
  { value: "국물없음", label: "국물 없는" },
  { value: "국물둘다", label: "둘 다" },
] as const;

/** 그 외 태그: 밥, 면, 혼밥가능, 웨이팅X, 매움, 신호등X (복수 선택) */
export const ADD_RESTAURANT_TAGS = [
  "밥",
  "면",
  "혼밥가능",
  "웨이팅X",
  "매움",
  "신호등X",
] as const;

export type SoupOption = (typeof SOUP_TAG_OPTIONS)[number]["value"];

export type AddRestaurantFormState = {
  name: string;
  category: string;
  priceRange: string;
  walkMinutes: string;
  naverLink: string;
  /** 국물: 있음/없음/둘 다 중 하나만 */
  soupOption: SoupOption | "";
  selectedTags: Set<string>;
  recommendMenu: string;
  locationText: string;
};

export function getInitialFormState(): AddRestaurantFormState {
  return {
    name: "",
    category: CATEGORIES[0].value,
    priceRange: PRICE_RANGES[0].value,
    walkMinutes: "",
    naverLink: "",
    soupOption: "",
    selectedTags: new Set(),
    recommendMenu: "",
    locationText: "",
  };
}

export const initialFormState = getInitialFormState();
