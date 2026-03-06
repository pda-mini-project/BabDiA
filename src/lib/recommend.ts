import type { PresetKey, PresetItem, FilterGroup } from "@/type/recommend";

/** 사진 속 세부 조건 기준 프리셋 → 태그 매핑 */
export const PRESET_MAP: Record<PresetKey, string[]> = {
  sunny: ["도보 10분", "국물 없는", "밥", "안 매운", "없어야 함"],
  rainy: ["도보 5분", "국물 있는", "밥", "없을 선호"],
  cold: ["국물 있는", "밥", "한식"],
  hot: ["국물 있는는", "면", "도보 5분", "13,000원 이하"],
  tired: ["도보 5분", "가능", "없을 선호", "10,000원 이하"],
  happy: ["거리_상관없음", "가격_상관없음", "있어도 됨", "양식"],
  stressed: ["매운", "국물 있는", "밥"],
  social: ["한식", "중식", "있어도 됨", "불가"],
};

/** 사진 속 오늘의 프리셋: 맑음, 비와요, 추워요, 더워요, 피곤해, 신나는 날, 스트레스, 단체 (8개) */
export const PRESETS: PresetItem[] = [
  { key: "sunny", icon: "☀️", label: "맑음" },
  { key: "rainy", icon: "☔", label: "비와요" },
  { key: "cold", icon: "❄️", label: "추워요" },
  { key: "hot", icon: "🥵", label: "더워요" },
  { key: "tired", icon: "😫", label: "피곤해" },
  { key: "happy", icon: "🥳", label: "신나는 날" },
  { key: "stressed", icon: "🧘‍♀️", label: "스트레스" },
  { key: "social", icon: "👥", label: "단체" },
];

/** 사진 속 세부 조건 그대로. 거리/가격/횡단보도 '상관없음'은 그룹별로 독립 */
export const FILTERS: FilterGroup[] = [
  {
    label: "📍 거리",
    tags: ["도보 5분", "도보 10분", "거리_상관없음"],
    singleChoice: true,
  },
  { label: "🍲 국물", tags: ["국물 있는", "국물 없는"] },
  { label: "🍚 밥/면", tags: ["밥", "면"] },
  {
    label: "🍜 음식 종류",
    tags: [
      "햄버거/샌드위치",
      "한식",
      "중식",
      "양식",
      "일식",
      "음식종류_상관없음",
    ],
  },
  {
    label: "💰 가격",
    tags: ["10,000원 이하", "13,000원 이하", "가격_상관없음"],
    singleChoice: true,
  },
  { label: "🚶‍♀️ 횡단보도", tags: ["없어야 함", "횡단보도_상관없음"] },
  { label: "🌶️ 맵기", tags: ["매운", "안 매운"] },
  { label: "🧑‍🤝‍🧑 혼밥", tags: ["가능", "불가"] },
  { label: "⌛ 웨이팅", tags: ["없을 선호", "있어도 됨"] },
];

export function buildRecommendQuery(params: {
  selectedTags: Set<string>;
  activePreset: PresetKey | null;
}): string {
  const { selectedTags, activePreset } = params;
  const search = new URLSearchParams();
  Array.from(selectedTags).forEach((t) => search.append("tag", t));
  if (activePreset) search.set("preset", activePreset);
  return search.toString();
}
