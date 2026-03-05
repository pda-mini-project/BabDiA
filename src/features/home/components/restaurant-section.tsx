"use client";

import { debounce } from "@/lib/debounce";
import { usePathname, useRouter } from "next/navigation";
import {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useTransition,
} from "react";
import styles from "./restaurant-section.module.css";

type HomeRestaurant = {
  id: number;
  name: string;
  rating: string | null;
  walkingMinutes: number | null;
  imageUrl: string | null;
  naverLink: string | null;
};

type RestaurantSectionProps = {
  restaurants: HomeRestaurant[];
  searchKeyword: string;
  sortBy: "latest" | "rating_desc" | "walking_asc";
  minRating: number;
  maxWalking: number;
  mealType: "all" | "soup" | "rice_noodle";
};

export default function RestaurantSection({
  restaurants,
  searchKeyword,
  sortBy,
  minRating,
  maxWalking,
  mealType,
}: RestaurantSectionProps) {
  const [fetchedImages, setFetchedImages] = useState<Record<number, string>>({});
  const [keyword, setKeyword] = useState(searchKeyword);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const trimmedSearchKeyword = searchKeyword.trim();
  const hasSearchKeyword = trimmedSearchKeyword.length > 0;
  const hasInputKeyword = keyword.trim().length > 0;
  const hasFilter =
    hasSearchKeyword ||
    sortBy !== "latest" ||
    minRating > 0 ||
    maxWalking > 0 ||
    mealType !== "all";
  const sortLabel =
    sortBy === "rating_desc"
      ? "평점 높은순"
      : sortBy === "walking_asc"
        ? "도보 가까운순"
        : "최신순";
  const activeConditionItems = [
    hasSearchKeyword ? `검색어 "${trimmedSearchKeyword}"` : null,
    sortBy !== "latest" ? `정렬 ${sortLabel}` : null,
    mealType === "soup"
      ? "유형 국물"
      : mealType === "rice_noodle"
        ? "유형 밥/면"
        : null,
    minRating > 0 ? `평점 ${minRating} 이상` : null,
    maxWalking > 0 ? `도보 ${maxWalking}분 이내` : null,
  ].filter((item): item is string => item !== null);
  const resultCountLabel = hasFilter
    ? `검색/필터 결과 ${restaurants.length}건`
    : `전체 ${restaurants.length}건`;

  const highlightedName = (name: string) => {
    if (!hasSearchKeyword) return name;

    const escapedKeyword = trimmedSearchKeyword.replace(
      /[.*+?^${}()|[\]\\]/g,
      "\\$&",
    );
    const regex = new RegExp(`(${escapedKeyword})`, "gi");
    const parts = name.split(regex);

    return parts.map((part, index) => {
      if (part.toLowerCase() === trimmedSearchKeyword.toLowerCase()) {
        return (
          <mark
            key={`${name}-highlight-${index}`}
            style={{
              background: "#fde68a",
              color: "inherit",
              borderRadius: 4,
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        );
      }

      return (
        <Fragment key={`${name}-text-${index}`}>
          {part}
        </Fragment>
      );
    });
  };

  useEffect(() => {
    setKeyword(searchKeyword);
  }, [searchKeyword]);

  useEffect(() => {
    let isMounted = true;
    const candidates = restaurants.filter(
      (restaurant) =>
        !restaurant.imageUrl &&
        !!restaurant.naverLink &&
        !fetchedImages[restaurant.id],
    );

    if (candidates.length === 0) return;

    void Promise.all(
      candidates.map(async (restaurant) => {
        try {
          const res = await fetch(
            `/api/restaurant-image?url=${encodeURIComponent(restaurant.naverLink!)}`,
          );
          const data = (await res.json()) as { imageUrl?: string | null };
          const nextImageUrl = data.imageUrl;
          if (!isMounted || !nextImageUrl) return;
          setFetchedImages((prev) => {
            if (prev[restaurant.id] === nextImageUrl) return prev;
            return { ...prev, [restaurant.id]: nextImageUrl };
          });
        } catch {
          // ignore image fetch error and keep fallback UI
        }
      }),
    );

    return () => {
      isMounted = false;
    };
  }, [restaurants, fetchedImages]);

  const replaceWithParams = useCallback(
    (next: {
      q?: string;
      sort?: "latest" | "rating_desc" | "walking_asc";
      mealType?: "all" | "soup" | "rice_noodle";
      minRating?: number;
      maxWalking?: number;
    }) => {
      const params = new URLSearchParams(window.location.search);
      if (next.q !== undefined) {
        const trimmed = next.q.trim();
        if (trimmed.length > 0) {
          params.set("q", trimmed);
        } else {
          params.delete("q");
        }
      }

      if (next.sort !== undefined) {
        if (next.sort === "latest") {
          params.delete("sort");
        } else {
          params.set("sort", next.sort);
        }
      }

      if (next.mealType !== undefined) {
        if (next.mealType === "all") {
          params.delete("mealType");
        } else {
          params.set("mealType", next.mealType);
        }
      }

      if (next.minRating !== undefined) {
        if (next.minRating > 0) {
          params.set("minRating", String(next.minRating));
        } else {
          params.delete("minRating");
        }
      }

      if (next.maxWalking !== undefined) {
        if (next.maxWalking > 0) {
          params.set("maxWalking", String(next.maxWalking));
        } else {
          params.delete("maxWalking");
        }
      }

      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router, startTransition],
  );

  const replaceWithKeyword = useCallback(
    (nextKeyword: string) => {
      replaceWithParams({ q: nextKeyword });
    },
    [replaceWithParams],
  );

  const updateSearchParams = useMemo(
    () =>
      debounce((nextKeyword: string) => {
        replaceWithKeyword(nextKeyword);
      }, 400),
    [replaceWithKeyword],
  );

  const handleSearchChange = (value: string) => {
    setKeyword(value);
    updateSearchParams(value);
  };

  const handleSearchSubmit = () => {
    replaceWithKeyword(keyword);
  };

  const handleClearInput = () => {
    setKeyword("");
    replaceWithKeyword("");
  };

  const handleResetFilters = () => {
    setKeyword("");
    replaceWithParams({
      q: "",
      sort: "latest",
      mealType: "all",
      minRating: 0,
      maxWalking: 0,
    });
  };

  const sortOptions: Array<{
    value: "latest" | "rating_desc" | "walking_asc";
    label: string;
  }> = [
    { value: "latest", label: "최신순" },
    { value: "rating_desc", label: "평점 높은순" },
    { value: "walking_asc", label: "도보 가까운순" },
  ];

  const minRatingOptions = [
    { value: 0, label: "전체" },
    { value: 4, label: "4.0+" },
    { value: 4.5, label: "4.5+" },
  ];

  const maxWalkingOptions = [
    { value: 0, label: "전체" },
    { value: 5, label: "5분 이내" },
    { value: 10, label: "10분 이내" },
    { value: 15, label: "15분 이내" },
  ];

  const mealTypeOptions: Array<{
    value: "all" | "soup" | "rice_noodle";
    label: string;
  }> = [
    { value: "all", label: "전체" },
    { value: "soup", label: "국물" },
    { value: "rice_noodle", label: "밥/면" },
  ];

  return (
    <section className="section">
      <div
        className="list-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 16,
        }}
      >
        <div
          className="section-title"
          style={{ fontWeight: 900, fontSize: 16, margin: 0 }}
        >
          🍽️ 식당 리스트
        </div>
        <div
          style={{
            fontSize: 13,
            color: "var(--muted, #6b7280)",
            fontWeight: 700,
          }}
        >
          {isPending ? "검색 중..." : resultCountLabel}
        </div>
      </div>

      <div
        className="search-row"
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 8,
          flexWrap: "wrap",
        }}
      >
        <input
          className="search"
          placeholder="식당 검색..."
          value={keyword}
          onChange={(e) => {
            handleSearchChange(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              handleSearchSubmit();
            }
          }}
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--line, #e5e7eb)",
            outline: "none",
            background: "#fff",
          }}
        />
        <button
          className="search-btn"
          type="button"
          onClick={handleSearchSubmit}
          disabled={isPending}
          style={{ opacity: isPending ? 0.7 : 1 }}
        >
          검색
        </button>
        <button
          className="search-btn"
          type="button"
          onClick={handleClearInput}
          disabled={!hasInputKeyword || isPending}
          style={{
            opacity: !hasInputKeyword || isPending ? 0.55 : 1,
          }}
        >
          초기화
        </button>
      </div>

      <div className={styles.filterBox}>
        <div className={styles.filterBoxHeader}>
          <button
            className={[
              styles.filterToggle,
              isFilterOpen ? styles.filterToggleActive : "",
            ].join(" ")}
            type="button"
            aria-expanded={isFilterOpen}
            onClick={() => {
              setIsFilterOpen((prev) => !prev);
            }}
            disabled={isPending}
          >
            <span className={styles.filterToggleIcon}>
              {isFilterOpen ? "▾" : "▸"}
            </span>
            정렬/필터
          </button>
          <div className={styles.conditionSummary}>
            {activeConditionItems.length > 0
              ? `적용 조건: ${activeConditionItems.join(" · ")}`
              : "적용 조건: 없음"}
          </div>
          <button
            type="button"
            className={styles.clearBtn}
            onClick={handleResetFilters}
            disabled={!hasFilter || isPending}
          >
            필터 해제
          </button>
        </div>
        {isFilterOpen && (
          <div className={styles.filterPanel}>
            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>유형</span>
              {mealTypeOptions.map((option) => {
                const isActive = mealType === option.value;
                return (
                  <button
                    key={`meal-${option.value}`}
                    type="button"
                    className={[
                      styles.filterTag,
                      isActive ? styles.filterTagActive : "",
                    ].join(" ")}
                    disabled={isPending}
                    onClick={() => {
                      replaceWithParams({ mealType: option.value });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>정렬</span>
              {sortOptions.map((option) => {
                const isActive = sortBy === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    className={[
                      styles.filterTag,
                      isActive ? styles.filterTagActive : "",
                    ].join(" ")}
                    disabled={isPending}
                    onClick={() => {
                      replaceWithParams({ sort: option.value });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>최소 평점</span>
              {minRatingOptions.map((option) => {
                const isActive = minRating === option.value;
                return (
                  <button
                    key={`rating-${option.value}`}
                    type="button"
                    className={[
                      styles.filterTag,
                      isActive ? styles.filterTagActive : "",
                    ].join(" ")}
                    disabled={isPending}
                    onClick={() => {
                      replaceWithParams({ minRating: option.value });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>

            <div className={styles.filterRow}>
              <span className={styles.filterLabel}>최대 도보</span>
              {maxWalkingOptions.map((option) => {
                const isActive = maxWalking === option.value;
                return (
                  <button
                    key={`walk-${option.value}`}
                    type="button"
                    className={[
                      styles.filterTag,
                      isActive ? styles.filterTagActive : "",
                    ].join(" ")}
                    disabled={isPending}
                    onClick={() => {
                      replaceWithParams({ maxWalking: option.value });
                    }}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div
        className="restaurant-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {restaurants.length === 0 && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: 20,
              borderRadius: 16,
              background: "#fff",
              border: "1px solid var(--line, #e5e7eb)",
              color: "var(--muted, #6b7280)",
              fontWeight: 700,
            }}
          >
            {hasSearchKeyword
              ? `"${trimmedSearchKeyword}" 검색 결과가 없습니다.`
              : "등록된 식당이 없습니다."}
          </div>
        )}

        {restaurants.map((restaurant) => {
          const imageUrl = restaurant.imageUrl ?? fetchedImages[restaurant.id] ?? null;
          return (
            <div
              key={restaurant.id}
              className="restaurant-card"
              onClick={() => router.push(`/restaurants/detail/${restaurant.id}`)}
              style={{
                borderRadius: 20,
                overflow: "hidden",
                border: "1px solid var(--line, #e5e7eb)",
                background: "#fff",
                boxShadow: "var(--shadow, 0 10px 30px rgba(0,0,0,0.05))",
                transition: "0.2s ease",
                cursor: "pointer",
              }}
            >
              <div
                className="restaurant-img"
                style={{
                  height: 160,
                  background: imageUrl
                    ? `center / cover no-repeat url(${imageUrl})`
                    : "#e0e7ff",
                }}
              />
              <div className="restaurant-body" style={{ padding: 18 }}>
                <div
                  className="restaurant-title"
                  style={{ fontWeight: 900, marginBottom: 8 }}
                >
                  {highlightedName(restaurant.name)}
                </div>
                <div
                  className="meta"
                  style={{ fontSize: 13, color: "var(--muted, #6b7280)" }}
                >
                  {`⭐ ${restaurant.rating ?? "-"} · 도보 ${restaurant.walkingMinutes ?? "-"}분`}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
