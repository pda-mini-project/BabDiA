import { db } from "@/db/client";
import {
  dailyRestaurantSelections,
  restaurants,
  reviews,
  restaurantTags,
  tags,
} from "@/db/schema";
import { and, desc, eq, ilike, sql, type SQL } from "drizzle-orm";

export type HomeSort = "latest" | "rating_desc" | "walking_asc";
export type HomeMealType = "all" | "soup" | "rice" | "noodle" | "rice_noodle";

export type HomeRestaurantRow = {
  id: number;
  name: string;
  rating: string | null;
  walkingMinutes: number | null;
  imageUrl: string | null;
  naverLink: string | null;
  reviewCount: number;
  todaySelectionCount: number;
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
    const todaySelectionCounts = db
      .select({
        restaurantId: dailyRestaurantSelections.restaurantId,
        todaySelectionCount: sql<number>`count(*)::int`.as(
          "today_selection_count",
        ),
      })
      .from(dailyRestaurantSelections)
      .where(
        sql`${dailyRestaurantSelections.selectedDate} = (timezone('Asia/Seoul', now())::date)`,
      )
      .groupBy(dailyRestaurantSelections.restaurantId)
      .as("today_selection_counts");

    const todaySelectionCountExpr = sql<number>`coalesce(${todaySelectionCounts.todaySelectionCount}, 0)`;
    const reviewCountSubquery = db
      .select({
        restaurantId: reviews.restaurantId,
        reviewCount: sql<number>`count(*)::int`.as("review_count"),
      })
      .from(reviews)
      .groupBy(reviews.restaurantId)
      .as("review_counts");
    const reviewCountExpr = sql<number>`coalesce(${reviewCountSubquery.reviewCount}, 0)`;
    const selectedPriorityExpr = sql<number>`case
      when ${todaySelectionCountExpr} > 0 then 0
      else 1
    end`;

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
      reviewCount: reviewCountExpr,
      todaySelectionCount: todaySelectionCountExpr,
    };

    if (sortBy === "rating_desc") {
      if (whereClause) {
        return await db
          .select(selectFields)
          .from(restaurants)
          .leftJoin(
            todaySelectionCounts,
            eq(todaySelectionCounts.restaurantId, restaurants.id),
          )
          .leftJoin(
            reviewCountSubquery,
            eq(reviewCountSubquery.restaurantId, restaurants.id),
          )
          .where(whereClause)
          .orderBy(
            selectedPriorityExpr,
            sql`${todaySelectionCountExpr} desc`,
            sql`${restaurants.rating} desc nulls last`,
            desc(restaurants.createdAt),
            desc(restaurants.id),
          )
          .limit(limit)
          .offset(offset);
      }
      return await db
        .select(selectFields)
        .from(restaurants)
        .leftJoin(
          todaySelectionCounts,
          eq(todaySelectionCounts.restaurantId, restaurants.id),
        )
        .leftJoin(
          reviewCountSubquery,
          eq(reviewCountSubquery.restaurantId, restaurants.id),
        )
        .orderBy(
          selectedPriorityExpr,
          sql`${todaySelectionCountExpr} desc`,
          sql`${restaurants.rating} desc nulls last`,
          desc(restaurants.createdAt),
          desc(restaurants.id),
        )
        .limit(limit)
        .offset(offset);
    }

    if (sortBy === "walking_asc") {
      if (whereClause) {
        return await db
          .select(selectFields)
          .from(restaurants)
          .leftJoin(
            todaySelectionCounts,
            eq(todaySelectionCounts.restaurantId, restaurants.id),
          )
          .leftJoin(
            reviewCountSubquery,
            eq(reviewCountSubquery.restaurantId, restaurants.id),
          )
          .where(whereClause)
          .orderBy(
            selectedPriorityExpr,
            sql`${todaySelectionCountExpr} desc`,
            sql`${restaurants.walkingMinutes} asc nulls last`,
            desc(restaurants.createdAt),
            desc(restaurants.id),
          )
          .limit(limit)
          .offset(offset);
      }
      return await db
        .select(selectFields)
        .from(restaurants)
        .leftJoin(
          todaySelectionCounts,
          eq(todaySelectionCounts.restaurantId, restaurants.id),
        )
        .leftJoin(
          reviewCountSubquery,
          eq(reviewCountSubquery.restaurantId, restaurants.id),
        )
        .orderBy(
          selectedPriorityExpr,
          sql`${todaySelectionCountExpr} desc`,
          sql`${restaurants.walkingMinutes} asc nulls last`,
          desc(restaurants.createdAt),
          desc(restaurants.id),
        )
        .limit(limit)
        .offset(offset);
    }

    if (whereClause) {
      return await db
        .select(selectFields)
        .from(restaurants)
        .leftJoin(
          todaySelectionCounts,
          eq(todaySelectionCounts.restaurantId, restaurants.id),
        )
        .leftJoin(
          reviewCountSubquery,
          eq(reviewCountSubquery.restaurantId, restaurants.id),
        )
        .where(whereClause)
        .orderBy(
          selectedPriorityExpr,
          sql`${todaySelectionCountExpr} desc`,
          desc(restaurants.createdAt),
          desc(restaurants.id),
        )
        .limit(limit)
        .offset(offset);
    }

    return await db
      .select(selectFields)
      .from(restaurants)
      .leftJoin(
        todaySelectionCounts,
        eq(todaySelectionCounts.restaurantId, restaurants.id),
      )
      .leftJoin(
        reviewCountSubquery,
        eq(reviewCountSubquery.restaurantId, restaurants.id),
      )
      .orderBy(
        selectedPriorityExpr,
        sql`${todaySelectionCountExpr} desc`,
        desc(restaurants.createdAt),
        desc(restaurants.id),
      )
      .limit(limit)
      .offset(offset);
  } catch (error) {
    if (isMissingDailySelectionTableError(error)) {
      return getHomeRestaurantsPageWithoutSelection(options);
    }
    console.error("Failed to load restaurants for home:", error);
    return [];
  }
}

function isMissingDailySelectionTableError(error: unknown) {
  const message =
    error instanceof Error
      ? error.message
      : typeof error === "string"
        ? error
        : "";
  return message.includes("daily_restaurant_selection");
}

async function getHomeRestaurantsPageWithoutSelection(
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
    reviewCount: sql<number>`0`.as("review_count"),
    todaySelectionCount: sql<number>`0`.as("today_selection_count"),
  };

  if (sortBy === "rating_desc") {
    if (whereClause) {
      return db
        .select(selectFields)
        .from(restaurants)
        .where(whereClause)
        .orderBy(
          sql`${restaurants.rating} desc nulls last`,
          desc(restaurants.createdAt),
          desc(restaurants.id),
        )
        .limit(limit)
        .offset(offset);
    }
    return db
      .select(selectFields)
      .from(restaurants)
      .orderBy(
        sql`${restaurants.rating} desc nulls last`,
        desc(restaurants.createdAt),
        desc(restaurants.id),
      )
      .limit(limit)
      .offset(offset);
  }

  if (sortBy === "walking_asc") {
    if (whereClause) {
      return db
        .select(selectFields)
        .from(restaurants)
        .where(whereClause)
        .orderBy(
          sql`${restaurants.walkingMinutes} asc nulls last`,
          desc(restaurants.createdAt),
          desc(restaurants.id),
        )
        .limit(limit)
        .offset(offset);
    }
    return db
      .select(selectFields)
      .from(restaurants)
      .orderBy(
        sql`${restaurants.walkingMinutes} asc nulls last`,
        desc(restaurants.createdAt),
        desc(restaurants.id),
      )
      .limit(limit)
      .offset(offset);
  }

  if (whereClause) {
    return db
      .select(selectFields)
      .from(restaurants)
      .where(whereClause)
      .orderBy(desc(restaurants.createdAt), desc(restaurants.id))
      .limit(limit)
      .offset(offset);
  }

  return db
    .select(selectFields)
    .from(restaurants)
    .orderBy(desc(restaurants.createdAt), desc(restaurants.id))
    .limit(limit)
    .offset(offset);
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
