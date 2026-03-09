import { NextResponse } from "next/server";
import { eq, and, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  restaurants,
  tagCategories,
  tags,
  restaurantTags,
} from "@/db/schema";
import {
  getCategoryCodeForTagName,
  TAG_CATEGORIES_SEED,
} from "@/lib/tag-categories";
import { fetchNaverRestaurantImage } from "@/lib/naver-image";

export type CreateRestaurantBody = {
  name: string;
  category?: string;
  priceRange?: string;
  walkMinutes?: string;
  naverLink?: string;
  selectedTags?: string[];
  recommendMenu?: string;
  locationText?: string;
};

/** 식당 추가: babdia.restaurants 저장, 선택 태그 있으면 restaurant_tags 연결 */
export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CreateRestaurantBody;
    const {
      name,
      category,
      priceRange,
      walkMinutes,
      naverLink,
      selectedTags = [],
      recommendMenu,
      locationText,
    } = body;

    const trimmedName = name?.trim() ?? "";
    if (!trimmedName) {
      return NextResponse.json(
        { error: "식당 이름은 필수입니다." },
        { status: 400 },
      );
    }

    // 식당 이름 중복 방지: 앞뒤 공백 제거 + 중간 공백 제거 후 비교 (예: "롯데 리아" ↔ "롯데리아")
    const normalizedName = trimmedName.replace(/\s+/g, "");
    const existing = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(
        sql`regexp_replace(trim(${restaurants.name}), '\s+', '', 'g') = ${normalizedName}`,
      )
      .limit(1)
      .then((rows) => rows[0]);

    if (existing) {
      return NextResponse.json(
        { error: "이미 같은 이름의 식당이 등록되어 있습니다.", existingId: existing.id },
        { status: 409 },
      );
    }

    const walkingMinutes =
      walkMinutes != null && walkMinutes !== ""
        ? parseInt(String(walkMinutes), 10)
        : null;
    const walkingMinutesValue =
      walkingMinutes != null && !Number.isNaN(walkingMinutes) && walkingMinutes >= 0
        ? walkingMinutes
        : null;

    const trimmedNaverLink = naverLink?.trim() || null;
    const imageUrl = trimmedNaverLink
      ? await fetchNaverRestaurantImage(trimmedNaverLink)
      : null;

    const [inserted] = await db
      .insert(restaurants)
      .values({
        name: trimmedName,
        category: category?.trim() || null,
        naverLink: trimmedNaverLink,
        recommendMenu: recommendMenu?.trim() || null,
        locationText: locationText?.trim() || null,
        priceRange: priceRange?.trim() || null,
        walkingMinutes: walkingMinutesValue,
        imageUrl,
      })
      .returning({ id: restaurants.id });

    if (!inserted) {
      return NextResponse.json(
        { error: "식당 등록에 실패했습니다." },
        { status: 500 },
      );
    }

    const restaurantId = inserted.id;

    if (selectedTags.length > 0) {
      // 국물/밥/면/맵기 등 태그 저장을 위해 tag_categories가 없으면 시드로 채움 (마이그레이션 미실행 대비)
      await db
        .insert(tagCategories)
        .values(
          TAG_CATEGORIES_SEED.map(({ code }) => ({ code })),
        )
        .onConflictDoNothing({ target: tagCategories.code });

      for (const tagName of selectedTags) {
        const trimmed = tagName?.trim();
        if (!trimmed) continue;

        const categoryCode = getCategoryCodeForTagName(trimmed);
        if (!categoryCode) continue;

        const categoryRow = await db
          .select({ id: tagCategories.id })
          .from(tagCategories)
          .where(eq(tagCategories.code, categoryCode))
          .limit(1)
          .then((rows) => rows[0]);

        if (!categoryRow) continue;

        let tagRow = await db
          .select({ id: tags.id })
          .from(tags)
          .where(
            and(
              eq(tags.name, trimmed),
              eq(tags.tagCategoryId, categoryRow.id),
            ),
          )
          .limit(1)
          .then((rows) => rows[0]);

        if (!tagRow) {
          const [newTag] = await db
            .insert(tags)
            .values({
              name: trimmed,
              tagCategoryId: categoryRow.id,
            })
            .returning({ id: tags.id });
          if (newTag) tagRow = newTag;
        }

        if (tagRow) {
          try {
            await db.insert(restaurantTags).values({
              restaurantId,
              tagId: tagRow.id,
            });
          } catch {
            // 이미 같은 (restaurantId, tagId) 조합이 있으면 무시
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      id: restaurantId,
      message: "식당이 등록되었습니다.",
    });
  } catch (err) {
    console.error("[POST /api/restaurants]", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
