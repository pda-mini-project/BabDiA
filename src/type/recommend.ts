export type PresetKey =
  | "sunny"
  | "cloudy"
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
