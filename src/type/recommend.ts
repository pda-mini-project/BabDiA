/** 사진 속 프리셋 7개 기준 (단체 제외) */
export type PresetKey =
  | "sunny"
  | "rainy"
  | "cold"
  | "hot"
  | "tired"
  | "happy"
  | "stressed";

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
