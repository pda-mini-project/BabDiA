"use client";

import { useCallback, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  CATEGORIES,
  PRICE_RANGES,
  SOUP_TAG_OPTIONS,
  WALK_OPTIONS,
  MEAL_OPTIONS,
  TRAFFIC_LIGHT_OPTIONS,
  SPICY_OPTIONS,
  SOLO_OPTIONS,
  WAITING_OPTIONS,
  buildSubmitPayload,
  type AddRestaurantFormState,
  type SoupOption,
  type WalkOption,
  type MealOption,
  type TrafficLightOption,
  type SpicyOption,
  type SoloOption,
  type WaitingOption,
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

function createFormState(
  initialData: EditRestaurantFormProps["initialData"],
): AddRestaurantFormState {
  const tags = initialData.selectedTags;

  const soupOption: SoupOption = tags.includes("국물있음")
    ? "국물있음"
    : tags.includes("국물없음")
      ? "국물없음"
      : tags.includes("국물둘다")
        ? "국물둘다"
        : SOUP_TAG_OPTIONS[0].value;

  const hasOver10 = tags.some((t) => t === "도보 10분 초과");
  const walkMinutesNum =
    initialData.walkMinutes !== ""
      ? parseInt(initialData.walkMinutes, 10)
      : null;
  const walkOption: AddRestaurantFormState["walkOption"] = hasOver10
    ? "over10"
    : walkMinutesNum === 10
      ? "10"
      : "5";

  const hasRice = tags.includes("밥");
  const hasNoodle = tags.includes("면");
  const mealOption: AddRestaurantFormState["mealOption"] =
    hasRice && hasNoodle ? "밥면" : hasNoodle ? "면" : "밥";

  const trafficLight: TrafficLightOption =
    tags.some((t) => t === "신호등X" || t === "없어야 함") ? "none" : "yes";

  const spicyOption: SpicyOption =
    tags.some((t) => t === "매움" || t === "매운") ? "매운" : "안 매운";

  const soloOption: SoloOption =
    tags.some((t) => t === "혼밥가능" || t === "가능") ? "가능" : "불가";

  const waitingOption: AddRestaurantFormState["waitingOption"] =
    tags.some((t) => t === "웨이팅X" || t === "없을 선호") ? "없을 선호" : "있어도 됨";

  return {
    name: initialData.name,
    category: initialData.category || CATEGORIES[0].value,
    priceRange: initialData.priceRange || PRICE_RANGES[0].value,
    walkOption,
    naverLink: initialData.naverLink ?? "",
    soupOption,
    mealOption,
    trafficLight,
    spicyOption,
    soloOption,
    waitingOption,
    recommendMenu: initialData.recommendMenu ?? "",
    locationText: initialData.locationText ?? "",
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
        const payload = buildSubmitPayload(form);
        const res = await fetch(`/api/restaurants/${restaurantId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
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
            <span className={styles.label}>분류 (필수)</span>
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
            <span className={styles.label}>가격대 (필수)</span>
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

        <div className={styles.field}>
          <span className={styles.label}>📍 거리 (필수)</span>
          <div className={styles.chips}>
            {WALK_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.walkOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="walkOption"
                  checked={form.walkOption === opt.value}
                  onChange={() => update("walkOption", opt.value as WalkOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>🍲 국물 (필수)</span>
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
          <span className={styles.label}>🍚 밥/면 (필수)</span>
          <div className={styles.chips}>
            {MEAL_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.mealOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="mealOption"
                  checked={form.mealOption === opt.value}
                  onChange={() => update("mealOption", opt.value as MealOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>🚦 신호등 (필수)</span>
          <div className={styles.chips}>
            {TRAFFIC_LIGHT_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.trafficLight === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="trafficLight"
                  checked={form.trafficLight === opt.value}
                  onChange={() => update("trafficLight", opt.value as TrafficLightOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>🌶️ 맵기 (필수)</span>
          <div className={styles.chips}>
            {SPICY_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.spicyOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="spicyOption"
                  checked={form.spicyOption === opt.value}
                  onChange={() => update("spicyOption", opt.value as SpicyOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>🧑‍🤝‍🧑 혼밥 (필수)</span>
          <div className={styles.chips}>
            {SOLO_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.soloOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="soloOption"
                  checked={form.soloOption === opt.value}
                  onChange={() => update("soloOption", opt.value as SoloOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
        </div>

        <div className={styles.field}>
          <span className={styles.label}>⌛ 웨이팅 (필수)</span>
          <div className={styles.chips}>
            {WAITING_OPTIONS.map((opt) => (
              <label
                key={opt.value}
                className={`${styles.chip} ${form.waitingOption === opt.value ? styles.chipActive : ""}`}
              >
                <input
                  type="radio"
                  name="waitingOption"
                  checked={form.waitingOption === opt.value}
                  onChange={() => update("waitingOption", opt.value as WaitingOption)}
                />
                {opt.label}
              </label>
            ))}
          </div>
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
