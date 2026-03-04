"use client";

import { useState, useCallback } from "react";
import {
  CATEGORIES,
  PRICE_RANGES,
  ADD_RESTAURANT_TAGS,
  getInitialFormState,
  type AddRestaurantFormState,
} from "@/lib/restaurant-form";
import styles from "./add-restaurant.module.css";

export default function AddRestaurantForm() {
  const [form, setForm] = useState<AddRestaurantFormState>(getInitialFormState);

  const update = useCallback(<K extends keyof AddRestaurantFormState>(
    key: K,
    value: AddRestaurantFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  }, []);

  const toggleTag = useCallback((tag: string) => {
    setForm((prev) => {
      const next = new Set(prev.selectedTags);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return { ...prev, selectedTags: next };
    });
  }, []);

  const handleReset = useCallback(() => {
    setForm(getInitialFormState());
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      // TODO: API 연동
      console.log("식당 추가 제출:", form);
      alert("저장 로직 연결하세요");
    },
    [form],
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

        <div className={styles.field}>
          <label className={styles.label} htmlFor="memo">
            메모
          </label>
          <textarea
            id="memo"
            className={styles.textarea}
            placeholder="후기 느낌 또는 참고 사항"
            value={form.memo}
            onChange={(e) => update("memo", e.target.value)}
          />
        </div>

        <div className={styles.actions}>
          <button
            type="button"
            className={`${styles.btn} ${styles.btnGhost}`}
            onClick={handleReset}
          >
            초기화
          </button>
          <button
            type="submit"
            className={`${styles.btn} ${styles.btnPrimary}`}
          >
            저장하기
          </button>
        </div>
      </form>
    </section>
  );
}
