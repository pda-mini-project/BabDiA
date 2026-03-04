"use client";

import type { FilterGroup } from "@/type/recommend";
import styles from "./recommend.module.css";

type FilterSectionProps = {
  filters: FilterGroup[];
  selectedTags: Set<string>;
  onToggleTag: (tag: string) => void;
  onStart: () => void;
};

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
              onClick={() => onToggleTag(tag)}
            >
              {tag}
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
