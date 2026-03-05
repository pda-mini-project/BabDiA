"use client";

import type { FilterGroup } from "@/type/recommend";
import styles from "./recommend.module.css";

type FilterSectionProps = {
  filters: FilterGroup[];
  selectedTags: Set<string>;
  /** exclusiveGroup 있으면 해당 그룹 태그 전부 제거 후 이 태그만 토글 (단일 선택) */
  onToggleTag: (tag: string, exclusiveGroup?: string[]) => void;
  onStart: () => void;
};

function getTagLabel(tag: string): string {
  return tag.includes("_상관없음") ? "상관없음" : tag;
}

export default function FilterSection({
  filters,
  selectedTags,
  onToggleTag,
  onStart,
}: FilterSectionProps) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionTitle}>🏷 세부 조건</div>

      {filters.map((row) => (
        <div key={row.label} className={styles.filterRow}>
          <span className={styles.filterLabel}>{row.label}</span>

          {row.tags.map((tag) => (
            <button
              key={tag}
              type="button"
              className={[
                styles.tag,
                selectedTags.has(tag) ? styles.tagActive : "",
              ].join(" ")}
              onClick={() =>
                onToggleTag(tag, row.singleChoice ? row.tags : undefined)
              }
            >
              {getTagLabel(tag)}
            </button>
          ))}
        </div>
      ))}

      <button className={styles.start} onClick={onStart} type="button">
        🎰 점메추 시작!
      </button>
    </section>
  );
}
