/**
 * 식당 추가 폼 옵션 (이미지 기준)
 */
export const CATEGORIES = [
  { value: "한식", label: "한식" },
  { value: "중식", label: "중식" },
  { value: "일식", label: "일식" },
  { value: "양식", label: "양식" },
  { value: "기타", label: "기타" },
] as const;

export const PRICE_RANGES = [
  { value: "~ 8,000원", label: "~ 8,000원" },
  { value: "8,000 ~ 12,000원", label: "8,000 ~ 12,000원" },
  { value: "12,000원 이상", label: "12,000원 이상" },
] as const;

/** 사진 속 태그: 국물, 밥, 면, 혼밥가능, 웨이팅X, 매움, 횡단보도X */
export const ADD_RESTAURANT_TAGS = [
  "국물",
  "밥",
  "면",
  "혼밥가능",
  "웨이팅X",
  "매움",
  "횡단보도X",
] as const;

export type AddRestaurantFormState = {
  name: string;
  category: string;
  priceRange: string;
  walkMinutes: string;
  naverLink: string;
  selectedTags: Set<string>;
  recommendMenu: string;
  locationText: string;
  memo: string;
};

export function getInitialFormState(): AddRestaurantFormState {
  return {
    name: "",
    category: CATEGORIES[0].value,
    priceRange: PRICE_RANGES[0].value,
    walkMinutes: "",
    naverLink: "",
    selectedTags: new Set(),
    recommendMenu: "",
    locationText: "",
    memo: "",
  };
}

export const initialFormState = getInitialFormState();
