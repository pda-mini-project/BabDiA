"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ADD_RESTAURANT_TAGS,
  CATEGORIES,
  PRICE_RANGES,
  SOUP_TAG_OPTIONS,
  type AddRestaurantFormState,
  type SoupOption,
} from "@/lib/restaurant-form";
import styles from "./add-restaurant.module.css";

type EditRestaurantFormProps = {
  restaurantId: string;
  initialData: {
    id: string;
    name: string;
    category: string;
    priceRange: string;
    walkMinutes: string;
    naverLink: string;
    recommendMenu: string;
    locationText: string;
    selectedTags: string[];
  };
};

const SOUP_VALUES = ["국물있음", "국물없음", "국물둘다"] as const;

function createFormState(
  initialData: EditRestaurantFormProps["initialData"],
): AddRestaurantFormState {
  const tags = initialData.selectedTags;
  const soupOption: AddRestaurantFormState["soupOption"] = tags.includes("국물있음")
    ? "국물있음"
    : tags.includes("국물없음")
      ? "국물없음"
      : tags.includes("국물둘다")
        ? "국물둘다"
        : "";
  const selectedTags = new Set(
    tags.filter((t) => !(SOUP_VALUES as readonly string[]).includes(t)),
  );
  return {
    name: initialData.name,
    category: initialData.category || CATEGORIES[0].value,
    priceRange: initialData.priceRange || PRICE_RANGES[0].value,
    walkMinutes: initialData.walkMinutes,
    naverLink: initialData.naverLink,
    soupOption,
    selectedTags,
    recommendMenu: initialData.recommendMenu,
    locationText: initialData.locationText,
  };
}

export default function EditRestaurantForm({
  restaurantId,
  initialData,
}: EditRestaurantFormProps) {
  const router = useRouter();
  const initialForm = useMemo(() => createFormState(initialData), [initialData]);
  const [form, setForm] = useState<AddRestaurantFormState>(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const update = useCallback(
    <K extends keyof AddRestaurantFormState>(
      key: K,
      value: AddRestaurantFormState[K],
    ) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => {
      const next = new Set(prev.selectedTags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return { ...prev, selectedTags: next };
    });
  }, []);

  const handleReset = useCallback(() => {
    setForm(createFormState(initialData));
    setSubmitError(null);
  }, [initialData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setSubmitError(null);
      setIsSubmitting(true);
      try {
        const res = await fetch(`/api/restaurants/${restaurantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name,
            category: form.category,
            priceRange: form.priceRange,
            walkMinutes: form.walkMinutes,
            naverLink: form.naverLink,
            selectedTags: [
              ...(form.soupOption ? [form.soupOption] : []),
              ...Array.from(form.selectedTags),
            ],
            recommendMenu: form.recommendMenu,
            locationText: form.locationText,
          }),
        });
        const data = await res.json().catch(() => ({}));
        if (!res.ok) {
          setSubmitError(data.error ?? "수정에 실패했습니다.");
          return;
        }
        alert(data.message ?? "식당 정보가 수정되었습니다.");
        router.push(`/restaurants/detail/${restaurantId}`);
      } catch {
        setSubmitError("네트워크 오류가 발생했습니다.");
      } finally {
        setIsSubmitting(false);
      }
    },
    [form, restaurantId, router],
  );

  return (
    <section className={styles.card}>
      <form className={styles.form} onSubmit={handleSubmit}>
        <div className={styles.field}>
          <label className={styles.label} htmlFor="name">
            식당 이름
          </label>
          <input
            id="name"
            className={styles.input}
            placeholder="예: 김치찌개집"
            value={form.name}
            onChange={(e) => update("name", e.target.value)}
          />
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="category">
              분류
            </label>
            <select
              id="category"
              className={styles.select}
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="priceRange">
              가격대
            </label>
            <select
              id="priceRange"
              className={styles.select}
              value={form.priceRange}
              onChange={(e) => update("priceRange", e.target.value)}
            >
              {PRICE_RANGES.map((p) => (
                <option key={p.value} value={p.value}>
                  {p.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.row2}>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="walkMinutes">
              도보 거리 (분)
            </label>
            <input
              id="walkMinutes"
              className={styles.input}
              type="number"
              placeholder="예: 5"
              min={0}
              value={form.walkMinutes}
              onChange={(e) => update("walkMinutes", e.target.value)}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label} htmlFor="naverLink">
              네이버 지도 링크
            </label>
            <input
              id="naverLink"
              className={styles.input}
              type="url"
              placeholder="https://map.naver.com/..."
              value={form.naverLink}
              onChange={(e) => update("naverLink", e.target.value)}
            />
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>국물 (하나만 선택)</span>
          <div className={styles.chips}>
            {SOUP_TAG_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.soupOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="soupOption"
                  checked={form.soupOption === opt.value}
                  onChange={() => update("soupOption", opt.value as SoupOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>
        <div className={styles.field}>
          <span className={styles.label}>태그 (복수 선택)</span>
          <div className={styles.chips}>
            {ADD_RESTAURANT_TAGS.map((tag) => (
              <label
                key={tag}
                className={`${styles.chip} ${form.selectedTags.has(tag) ? styles.chipActive : ""}`}
              >
                <input
                  type="checkbox"
                  checked={form.selectedTags.has(tag)}
                  onChange={() => toggleTag(tag)}
                />
                {tag}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="recommendMenu">
            추천 메뉴
          </label>
          <input
            id="recommendMenu"
            className={styles.input}
            placeholder="예: 돼지김치찌개"
            value={form.recommendMenu}
            onChange={(e) => update("recommendMenu", e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label} htmlFor="locationText">
            위치 설명
          </label>
          <input
            id="locationText"
            className={styles.input}
            placeholder="예: 성수역 3번 출구 근처"
            value={form.locationText}
            onChange={(e) => update("locationText", e.target.value)}
          />
        </div>

        {submitError && (
          <p className={styles.error} role="alert">
            {submitError}
          </p>
        )}

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={handleReset}
            disabled={isSubmitting}
          >
            원래 값으로
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
            disabled={isSubmitting}
          >
            {isSubmitting ? "저장 중..." : "수정하기"}
          </button>
        </div>
      </form>
    </section>
  );
}
