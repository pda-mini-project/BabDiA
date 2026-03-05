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

type HomeRestaurant = {
  id: number;
  name: string;
  rating: string | null;
  walkingMinutes: number | null;
  imageUrl: string | null;
};

type RestaurantSectionProps = {
  restaurants: HomeRestaurant[];
  searchKeyword: string;
};

export default function RestaurantSection({
  restaurants,
  searchKeyword,
}: RestaurantSectionProps) {
  const [keyword, setKeyword] = useState(searchKeyword);
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const trimmedSearchKeyword = searchKeyword.trim();
  const hasSearchKeyword = trimmedSearchKeyword.length > 0;
  const resultCountLabel = hasSearchKeyword
    ? `검색 결과 ${restaurants.length}건`
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

  const replaceWithKeyword = useCallback(
    (nextKeyword: string) => {
      const params = new URLSearchParams(window.location.search);
      const trimmed = nextKeyword.trim();

      if (trimmed.length > 0) {
        params.set("q", trimmed);
      } else {
        params.delete("q");
      }

      const queryString = params.toString();
      startTransition(() => {
        router.replace(queryString ? `${pathname}?${queryString}` : pathname, {
          scroll: false,
        });
      });
    },
    [pathname, router],
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
        style={{ display: "flex", gap: 10, marginBottom: 20 }}
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
        >
          검색
        </button>
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

        {restaurants.map((restaurant) => (
          <div
            key={restaurant.id}
            className="restaurant-card"
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
                background: restaurant.imageUrl
                  ? `center / cover no-repeat url(${restaurant.imageUrl})`
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
        ))}
      </div>
    </section>
  );
}
