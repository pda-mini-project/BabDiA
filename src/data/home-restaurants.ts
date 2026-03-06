import { db } from "@/db/client";
import { restaurants, restaurantTags, tags } from "@/db/schema";
import { and, desc, ilike, sql, type SQL } from "drizzle-orm";

export type HomeSort = "latest" | "rating_desc" | "walking_asc";
export type HomeMealType = "all" | "soup" | "rice" | "noodle" | "rice_noodle";

export type HomeRestaurantRow = {
  id: number;
  name: string;
  rating: string | null;
  walkingMinutes: number | null;
  imageUrl: string | null;
  naverLink: string | null;
};

export type GetHomeRestaurantsOptions = {
  searchQuery: string;
  sortBy: HomeSort;
  minRating: number;
  maxWalking: number;
  mealType: HomeMealType;
  limit: number;
  offset: number;
};

/** 전체 개수 조회용 (limit/offset 없이 같은 필터만 적용) */
export type GetHomeRestaurantsCountOptions = {
  searchQuery: string;
  minRating: number;
  maxWalking: number;
  mealType: HomeMealType;
};

export async function getHomeRestaurantsPage(
  options: GetHomeRestaurantsOptions,
): Promise<HomeRestaurantRow[]> {
  const {
    searchQuery,
    sortBy,
    minRating,
    maxWalking,
    mealType,
    limit,
    offset,
  } = options;

  const keyword = searchQuery.trim();
  const ratingFloor = Number.isFinite(minRating) ? minRating : 0;
  const walkingCeil = Number.isFinite(maxWalking) ? maxWalking : 0;

  try {
    const filters: SQL[] = [];
    if (keyword.length > 0) filters.push(ilike(restaurants.name, `%${keyword}%`));
    if (ratingFloor > 0) {
      filters.push(sql`${restaurants.rating} >= ${ratingFloor}`);
    }
    if (walkingCeil > 0) {
      filters.push(sql`${restaurants.walkingMinutes} <= ${walkingCeil}`);
    }
    if (mealType !== "all") {
      if (mealType === "rice_noodle") {
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} in ('밥', '면')
          )`,
        );
      } else if (mealType === "soup") {
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} in ('국물있음', '국물둘다')
          )`,
        );
      } else {
        const mealTagName = mealType === "rice" ? "밥" : "면";
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} = ${mealTagName}
          )`,
        );
      }
    }

    const whereClause =
      filters.length === 0
        ? undefined
        : filters.length === 1
          ? filters[0]
          : and(...filters);

    const selectFields = {
      id: restaurants.id,
      name: restaurants.name,
      rating: restaurants.rating,
      walkingMinutes: restaurants.walkingMinutes,
      imageUrl: restaurants.imageUrl,
      naverLink: restaurants.naverLink,
    };

    if (sortBy === "rating_desc") {
      if (whereClause) {
        return await db
          .select(selectFields)
          .from(restaurants)
          .where(whereClause)
          .orderBy(sql`${restaurants.rating} desc nulls last`, desc(restaurants.createdAt))
          .limit(limit)
          .offset(offset);
      }
      return await db
        .select(selectFields)
        .from(restaurants)
        .orderBy(sql`${restaurants.rating} desc nulls last`, desc(restaurants.createdAt))
        .limit(limit)
        .offset(offset);
    }

    if (sortBy === "walking_asc") {
      if (whereClause) {
        return await db
          .select(selectFields)
          .from(restaurants)
          .where(whereClause)
          .orderBy(sql`${restaurants.walkingMinutes} asc nulls last`, desc(restaurants.createdAt))
          .limit(limit)
          .offset(offset);
      }
      return await db
        .select(selectFields)
        .from(restaurants)
        .orderBy(sql`${restaurants.walkingMinutes} asc nulls last`, desc(restaurants.createdAt))
        .limit(limit)
        .offset(offset);
    }

    if (whereClause) {
      return await db
        .select(selectFields)
        .from(restaurants)
        .where(whereClause)
        .orderBy(desc(restaurants.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return await db
      .select(selectFields)
      .from(restaurants)
      .orderBy(desc(restaurants.createdAt), desc(restaurants.id))
      .limit(limit)
      .offset(offset);
  } catch (error) {
    console.error("Failed to load restaurants for home:", error);
    return [];
  }
}

export async function getHomeRestaurantsCount(
  options: GetHomeRestaurantsCountOptions,
): Promise<number> {
  const { searchQuery, minRating, maxWalking, mealType } = options;
  const keyword = searchQuery.trim();
  const ratingFloor = Number.isFinite(minRating) ? minRating : 0;
  const walkingCeil = Number.isFinite(maxWalking) ? maxWalking : 0;

  try {
    const filters: SQL[] = [];
    if (keyword.length > 0) filters.push(ilike(restaurants.name, `%${keyword}%`));
    if (ratingFloor > 0) {
      filters.push(sql`${restaurants.rating} >= ${ratingFloor}`);
    }
    if (walkingCeil > 0) {
      filters.push(sql`${restaurants.walkingMinutes} <= ${walkingCeil}`);
    }
    if (mealType !== "all") {
      if (mealType === "rice_noodle") {
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} in ('밥', '면')
          )`,
        );
      } else if (mealType === "soup") {
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} in ('국물있음', '국물둘다')
          )`,
        );
      } else {
        const mealTagName = mealType === "rice" ? "밥" : "면";
        filters.push(
          sql`exists (
            select 1
            from ${restaurantTags}
            inner join ${tags} on ${tags.id} = ${restaurantTags.tagId}
            where ${restaurantTags.restaurantId} = ${restaurants.id}
              and ${tags.name} = ${mealTagName}
          )`,
        );
      }
    }

    const whereClause =
      filters.length === 0
        ? undefined
        : filters.length === 1
          ? filters[0]
          : and(...filters);

    const q = db
      .select({ count: sql<number>`count(*)::int` })
      .from(restaurants);
    const result = whereClause ? await q.where(whereClause) : await q;
    return result[0]?.count ?? 0;
  } catch (error) {
    console.error("Failed to count restaurants for home:", error);
    return 0;
  }
}
