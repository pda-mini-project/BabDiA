/** 사진 속 프리셋 8개 기준 */
export type PresetKey =
  | "sunny"
  | "rainy"
  | "cold"
  | "hot"
  | "tired"
  | "happy"
  | "stressed"
  | "social";

export type PresetItem = {
  key: PresetKey;
  icon: string;
  label: string;
};

export type FilterGroup = {
  label: string;
  tags: string[];
  /** true면 해당 그룹에서 하나만 선택 가능 (거리, 가격) */
  singleChoice?: boolean;
};
