import { NextResponse } from "next/server";
import { eq, and } from "drizzle-orm";
import { db } from "@/db/client";
import {
  restaurants,
  tagCategories,
  tags,
  restaurantTags,
} from "@/db/schema";

const DEFAULT_TAG_CATEGORY_CODE = "default";

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

    if (!name?.trim()) {
      return NextResponse.json(
        { error: "식당 이름은 필수입니다." },
        { status: 400 },
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

    const [inserted] = await db
      .insert(restaurants)
      .values({
        name: name.trim(),
        category: category?.trim() || null,
        naverLink: naverLink?.trim() || null,
        recommendMenu: recommendMenu?.trim() || null,
        locationText: locationText?.trim() || null,
        priceRange: priceRange?.trim() || null,
        walkingMinutes: walkingMinutesValue,
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
      let categoryRow = await db
        .select({ id: tagCategories.id })
        .from(tagCategories)
        .where(eq(tagCategories.code, DEFAULT_TAG_CATEGORY_CODE))
        .limit(1)
        .then((rows) => rows[0]);

      if (!categoryRow) {
        const [newCat] = await db
          .insert(tagCategories)
          .values({ name: "기본", code: DEFAULT_TAG_CATEGORY_CODE })
          .returning({ id: tagCategories.id });
        if (newCat) categoryRow = newCat;
      }

      if (categoryRow) {
        for (const tagName of selectedTags) {
          if (!tagName?.trim()) continue;

          let tagRow = await db
            .select({ id: tags.id })
            .from(tags)
            .where(
              and(
                eq(tags.name, tagName.trim()),
                eq(tags.tagCategoryId, categoryRow.id),
              ),
            )
            .limit(1)
            .then((rows) => rows[0]);

          if (!tagRow) {
            const [newTag] = await db
              .insert(tags)
              .values({
                name: tagName.trim(),
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
