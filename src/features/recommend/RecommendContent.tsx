"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AppShell from "@/components/layouts/app-shell";
import PresetSection from "@/components/recommend/PresetSection";
import FilterSection from "@/components/recommend/FilterSection";
import type { PresetKey } from "@/type/recommend";
import {
  PRESET_MAP,
  PRESETS,
  FILTERS,
  buildRecommendQuery,
} from "@/lib/recommend";

export default function RecommendContent() {
  const router = useRouter();
  const [activePreset, setActivePreset] = useState<PresetKey | null>(null);
  const [selectedTags, setSelectedTags] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!activePreset) {
      setSelectedTags(new Set());
      return;
    }
    setSelectedTags(new Set(PRESET_MAP[activePreset]));
  }, [activePreset]);

  const toggleTag = (tag: string, exclusiveGroup?: string[]) => {
    setSelectedTags((prev) => {
      const next = new Set(prev);
      if (exclusiveGroup) {
        exclusiveGroup.forEach((t) => next.delete(t));
        if (!prev.has(tag)) next.add(tag);
        return next;
      }
      next.has(tag) ? next.delete(tag) : next.add(tag);
      return next;
    });
  };

  const onClickPreset = (key: PresetKey) => {
    setActivePreset((prev) => (prev === key ? null : key));
  };

  const handleStart = () => {
    const query = buildRecommendQuery({ selectedTags, activePreset });
    router.push(`/recommend/result?${query}`);
  };

  return (
    <AppShell>
      <div className="breadcrumb"></div>
      <h1 className="page-title" style={{ marginBottom: 24 }}>점메추</h1>

      <PresetSection
        presets={PRESETS}
        activePreset={activePreset}
        onPresetClick={onClickPreset}
      />

      <FilterSection
        filters={FILTERS}
        selectedTags={selectedTags}
        onToggleTag={toggleTag}
        onStart={handleStart}
      />
    </AppShell>
  );
}
