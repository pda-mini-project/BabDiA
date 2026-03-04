import type { PresetKey, PresetItem, FilterGroup } from "@/type/recommend";

export const PRESET_MAP: Record<PresetKey, string[]> = {
  sunny: ["도보 10분", "국물 없는", "밥", "순한", "없어야 함"],
  cloudy: ["도보 10분", "보통", "없어야 함"],
  rainy: ["도보 5분", "국물 있는", "밥", "없음 선호"],
  cold: ["국물 있는", "매운", "밥", "한식"],
  hot: ["국물 없는", "면", "도보 5분", "저렴"],
  tired: ["도보 5분", "가능", "없음 선호", "저렴"],
  happy: ["비싸도 됨", "있어도 됨", "양식"],
  stressed: ["매운", "국물 있는", "밥"],
  social: ["한식", "중식", "보통", "있어도 됨", "불가"],
};

export const PRESETS: PresetItem[] = [
  { key: "sunny", icon: "☀️", label: "맑음" },
  { key: "cloudy", icon: "⛅", label: "흐림" },
  { key: "rainy", icon: "🌧️", label: "비 와요" },
  { key: "cold", icon: "❄️", label: "추워요" },
  { key: "hot", icon: "🔥", label: "더워요" },
  { key: "tired", icon: "😴", label: "피곤해" },
  { key: "happy", icon: "🎉", label: "신나는 날" },
  { key: "stressed", icon: "😤", label: "스트레스" },
  { key: "social", icon: "🤝", label: "단체로" },
];

export const FILTERS: FilterGroup[] = [
  { label: "📍 거리", tags: ["도보 5분", "도보 10분", "상관없음"] },
  { label: "🍲 국물", tags: ["국물 있는", "국물 없는"] },
  { label: "🍚 밥/면", tags: ["밥", "면"] },
  {
    label: "🍽 음식 종류",
    tags: ["햄버거/샌드위치", "한식", "중식", "양식", "일식"],
  },
  { label: "💰 가격", tags: ["저렴", "보통", "비싸도 됨"] },
  { label: "🚦 횡단보도", tags: ["없어야 함", "상관없음"] },
  { label: "🌶 맵기", tags: ["순한", "보통", "매운"] },
  { label: "👤 혼밥", tags: ["가능", "불가"] },
  { label: "⏳ 웨이팅", tags: ["없음 선호", "있어도 됨"] },
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
