"use client";

import type { PresetKey, PresetItem } from "@/type/recommend";
import styles from "./recommend.module.css";

type PresetSectionProps = {
  presets: PresetItem[];
  activePreset: PresetKey | null;
  onPresetClick: (key: PresetKey) => void;
};

export default function PresetSection({
  presets,
  activePreset,
  onPresetClick,
}: PresetSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>✨ 오늘의 프리셋</div>

      <div className={styles.presetRow}>
        {presets.map((p) => (
          <button
            key={p.key}
            type="button"
            className={[
              styles.presetChip,
              activePreset === p.key ? styles.presetChipActive : "",
            ].join(" ")}
            onClick={() => onPresetClick(p.key)}
          >
            <span className={styles.icon}>{p.icon}</span>
            <span className={styles.label}>{p.label}</span>
          </button>
        ))}
      </div>

      <div
        className={[
          styles.presetBadge,
          activePreset ? styles.presetBadgeShow : "",
        ].join(" ")}
      >
        ✓ 프리셋 적용됨 — 아래 태그를 직접 수정할 수 있어요
      </div>
    </section>
  );
}
