import { NextResponse } from "next/server";
import { and, eq, ne, sql } from "drizzle-orm";
import { db } from "@/db/client";
import {
  restaurants,
  tagCategories,
  tags,
  restaurantTags,
} from "@/db/schema";
import { getRestaurantEditRecord } from "@/data/restaurant-edit";
import {
  getCategoryCodeForTagName,
  TAG_CATEGORIES_SEED,
} from "@/lib/tag-categories";

type RouteParams = { params: Promise<{ restaurantId: string }> };

type UpdateRestaurantBody = {
  name: string;
  category?: string;
  priceRange?: string;
  walkMinutes?: string;
  naverLink?: string;
  selectedTags?: string[];
  recommendMenu?: string;
  locationText?: string;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }

    const restaurant = await getRestaurantEditRecord(restaurantId);
    if (!restaurant) {
      return NextResponse.json({ error: "식당을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[GET /api/restaurants/[restaurantId]]", err);
    return NextResponse.json(
      { error: "식당 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { restaurantId } = await params;
    const restaurantIdNumber = Number(restaurantId);
    if (!Number.isFinite(restaurantIdNumber)) {
      return NextResponse.json({ error: "유효하지 않은 식당 ID입니다." }, { status: 400 });
    }

    const body = (await request.json()) as UpdateRestaurantBody;
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

    const normalizedName = trimmedName.replace(/\s+/g, "");
    const existing = await db
      .select({ id: restaurants.id })
      .from(restaurants)
      .where(
        and(
          sql`regexp_replace(trim(${restaurants.name}), '\s+', '', 'g') = ${normalizedName}`,
          ne(restaurants.id, restaurantIdNumber),
        ),
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

    const uniqueTags = Array.from(
      new Set(
        selectedTags
          .map((tag) => tag?.trim())
          .filter((tag): tag is string => Boolean(tag)),
      ),
    );

    const updated = await db.transaction(async (tx) => {
      const [updatedRestaurant] = await tx
        .update(restaurants)
        .set({
          name: trimmedName,
          category: category?.trim() || null,
          naverLink: naverLink?.trim() || null,
          recommendMenu: recommendMenu?.trim() || null,
          locationText: locationText?.trim() || null,
          priceRange: priceRange?.trim() || null,
          walkingMinutes: walkingMinutesValue,
        })
        .where(eq(restaurants.id, restaurantIdNumber))
        .returning({ id: restaurants.id });

      if (!updatedRestaurant) {
        return null;
      }

      await tx
        .delete(restaurantTags)
        .where(eq(restaurantTags.restaurantId, restaurantIdNumber));

      if (uniqueTags.length > 0) {
        await tx
          .insert(tagCategories)
          .values(TAG_CATEGORIES_SEED.map(({ name: n, code }) => ({ name: n, code })))
          .onConflictDoNothing({ target: tagCategories.code });

        for (const tagName of uniqueTags) {
          const categoryCode = getCategoryCodeForTagName(tagName);
          if (!categoryCode) continue;

          const categoryRow = await tx
            .select({ id: tagCategories.id })
            .from(tagCategories)
            .where(eq(tagCategories.code, categoryCode))
            .limit(1)
            .then((rows) => rows[0]);

          if (!categoryRow) continue;

          let tagRow = await tx
            .select({ id: tags.id })
            .from(tags)
            .where(
              and(
                eq(tags.name, tagName),
                eq(tags.tagCategoryId, categoryRow.id),
              ),
            )
            .limit(1)
            .then((rows) => rows[0]);

          if (!tagRow) {
            const [newTag] = await tx
              .insert(tags)
              .values({
                name: tagName,
                tagCategoryId: categoryRow.id,
              })
              .returning({ id: tags.id });
            if (newTag) tagRow = newTag;
          }

          if (tagRow) {
            await tx.insert(restaurantTags).values({
              restaurantId: restaurantIdNumber,
              tagId: tagRow.id,
            });
          }
        }
      }

      return updatedRestaurant;
    });

    if (!updated) {
      return NextResponse.json({ error: "식당을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      id: updated.id,
      message: "식당 정보가 수정되었습니다.",
    });
  } catch (err) {
    console.error("[PATCH /api/restaurants/[restaurantId]]", err);
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
