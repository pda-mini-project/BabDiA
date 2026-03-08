import { NextResponse } from "next/server";
import { eq, and, inArray } from "drizzle-orm";
import { db } from "@/db/client";
import { restaurants, tags, restaurantTags } from "@/db/schema";
import { parseRecommendTags } from "@/lib/recommend-mapping";
import type { Restaurant } from "@/type/result";
import { PRESET_MAP } from "@/lib/recommend";
import type { PresetKey } from "@/type/recommend";

function toResultRestaurant(
  row: {
    id: number;
    name: string;
    recommendMenu: string | null;
    locationText: string | null;
    priceRange: string | null;
    walkingMinutes: number | null;
    naverLink: string | null;
    imageUrl: string | null;
    rating: string | null;
  },
  tagNames: string[],
): Restaurant {
  const hasWaitingX = tagNames.includes("웨이팅X");
  const hasSolo = tagNames.includes("혼밥가능");
  const hasCrosswalkX = tagNames.includes("신호등X");
  return {
    id: String(row.id),
    name: row.name,
    emoji: "🍽️",
    rating: row.rating != null ? Number(row.rating) : 0,
    walkMin: row.walkingMinutes ?? 0,
    price: row.priceRange ?? "-",
    wait: hasWaitingX ? "웨이팅 없음" : "웨이팅 있음",
    recommendedMenu: row.recommendMenu ?? "-",
    tags: tagNames,
    address: row.locationText ?? undefined,
    solo: hasSolo ? "가능" : undefined,
    crosswalk: hasCrosswalkX ? "없음" : "있음",
    naverMapUrl: row.naverLink ?? undefined,
    mapQuery: row.name,
    imageUrl: row.imageUrl ?? undefined,
  };
}

/** GET /api/recommend?tag=밥&tag=도보+5분&preset=hot 등 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const tagParam = searchParams.getAll("tag");
    const presetParam = searchParams.get("preset");

    let tagStrings = tagParam.slice();
    if (presetParam && presetParam in PRESET_MAP) {
      tagStrings = [...new Set([...PRESET_MAP[presetParam as PresetKey], ...tagStrings])];
    }

    const condition = parseRecommendTags(tagStrings);

    const allRestaurants = await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        category: restaurants.category,
        recommendMenu: restaurants.recommendMenu,
        locationText: restaurants.locationText,
        priceRange: restaurants.priceRange,
        walkingMinutes: restaurants.walkingMinutes,
        naverLink: restaurants.naverLink,
        imageUrl: restaurants.imageUrl,
        rating: restaurants.rating,
      })
      .from(restaurants);

    if (allRestaurants.length === 0) {
      return NextResponse.json({ restaurants: [] });
    }

    const restaurantIds = allRestaurants.map((r) => r.id);
    // 9개 카테고리로 나뉜 태그 전부 조회 (조건 필터 + 결과 표시용)
    const tagRows = await db
      .select({
        restaurantId: restaurantTags.restaurantId,
        tagName: tags.name,
      })
      .from(restaurantTags)
      .innerJoin(tags, eq(restaurantTags.tagId, tags.id))
      .where(inArray(restaurantTags.restaurantId, restaurantIds));

    const tagsByRestaurantId = new Map<number, string[]>();
    for (const r of tagRows) {
      const list = tagsByRestaurantId.get(r.restaurantId) ?? [];
      if (!list.includes(r.tagName)) list.push(r.tagName);
      tagsByRestaurantId.set(r.restaurantId, list);
    }

    let allowedIds = new Set(allRestaurants.map((r) => r.id));

    for (const tagName of condition.requireTags) {
      const idsWithTag = new Set(
        tagRows.filter((row) => row.tagName === tagName).map((row) => row.restaurantId),
      );
      allowedIds = new Set([...allowedIds].filter((id) => idsWithTag.has(id)));
    }

    for (const tagGroup of condition.requireAnyOf ?? []) {
      const idsWithAny = new Set(
        tagRows
          .filter((row) => tagGroup.includes(row.tagName))
          .map((row) => row.restaurantId),
      );
      allowedIds = new Set([...allowedIds].filter((id) => idsWithAny.has(id)));
    }

    for (const tagName of condition.excludeTags) {
      const idsWithTag = new Set(
        tagRows.filter((row) => row.tagName === tagName).map((row) => row.restaurantId),
      );
      allowedIds = new Set([...allowedIds].filter((id) => !idsWithTag.has(id)));
    }

    const filtered = allRestaurants.filter((r) => {
      if (!allowedIds.has(r.id)) return false;
      if (condition.priceRange != null) {
        const pr = condition.priceRange;
        if (pr === "10,000원 이하") {
          if (r.priceRange !== "10,000원 이하") return false;
        } else if (pr === "13,000원 이하") {
          if (
            r.priceRange !== "10,000원 이하" &&
            r.priceRange !== "13,000원 이하"
          )
            return false;
        }
        // "13,000원 초과" 선택 시에는 가격대 상관없이 통과
      }
      if (condition.maxWalkingMinutes != null) {
        const w = r.walkingMinutes;
        // 거리 선택 시: walkingMinutes null(도보 10분 초과)이면 제외. 상관없음이면 maxWalkingMinutes null이라 여기 안 탐.
        if (w == null) return false;
        if (w > condition.maxWalkingMinutes) return false;
      }
      if (condition.category != null && r.category !== condition.category) return false;
      return true;
    });

    const result: Restaurant[] = filtered.map((r) =>
      toResultRestaurant(r, tagsByRestaurantId.get(r.id) ?? []),
    );

    return NextResponse.json({ restaurants: result });
  } catch (err) {
    console.error("[GET /api/recommend]", err);
    return NextResponse.json(
      { error: "추천 조회 중 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
