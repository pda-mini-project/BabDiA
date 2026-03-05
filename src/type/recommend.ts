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
};
