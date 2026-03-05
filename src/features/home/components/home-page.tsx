import AppShell from "@/components/layouts/app-shell";
import { db } from "@/db/client";
import { restaurants, restaurantTags, tags } from "@/db/schema";
import { and, desc, ilike, sql, type SQL } from "drizzle-orm";
import HomeHeader from "./home-header";
import HeroSection from "./hero-section";
import RestaurantSection from "./restaurant-section";

type HomeSort = "latest" | "rating_desc" | "walking_asc";
type HomeMealType = "all" | "soup" | "rice" | "noodle" | "rice_noodle";

type HomePageProps = {
  searchQuery?: string;
  sortBy?: string;
  minRating?: number;
  maxWalking?: number;
  mealType?: string;
};

type HomeRestaurantQueryOptions = {
  searchQuery: string;
  sortBy: HomeSort;
  minRating: number;
  maxWalking: number;
  mealType: HomeMealType;
};

function toHomeSort(sortBy: string): HomeSort {
  if (sortBy === "rating_desc" || sortBy === "walking_asc") {
    return sortBy;
  }
  return "latest";
}

function toHomeMealType(mealType: string): HomeMealType {
  if (
    mealType === "soup" ||
    mealType === "rice" ||
    mealType === "noodle" ||
    mealType === "rice_noodle"
  ) {
    return mealType;
  }
  return "all";
}

async function getHomeRestaurants({
  searchQuery,
  sortBy,
  minRating,
  maxWalking,
  mealType,
}: HomeRestaurantQueryOptions) {
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
      } else {
        const mealTagName = mealType === "soup" ? "국물" : mealType === "rice" ? "밥" : "면";
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

    if (sortBy === "rating_desc") {
      if (whereClause) {
        return await db
          .select({
            id: restaurants.id,
            name: restaurants.name,
            rating: restaurants.rating,
            walkingMinutes: restaurants.walkingMinutes,
            imageUrl: restaurants.imageUrl,
            naverLink: restaurants.naverLink,
          })
          .from(restaurants)
          .where(whereClause)
          .orderBy(sql`${restaurants.rating} desc nulls last`, desc(restaurants.createdAt))
          .limit(20);
      }

      return await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          rating: restaurants.rating,
          walkingMinutes: restaurants.walkingMinutes,
          imageUrl: restaurants.imageUrl,
          naverLink: restaurants.naverLink,
        })
        .from(restaurants)
        .orderBy(sql`${restaurants.rating} desc nulls last`, desc(restaurants.createdAt))
        .limit(20);
    }

    if (sortBy === "walking_asc") {
      if (whereClause) {
        return await db
          .select({
            id: restaurants.id,
            name: restaurants.name,
            rating: restaurants.rating,
            walkingMinutes: restaurants.walkingMinutes,
            imageUrl: restaurants.imageUrl,
            naverLink: restaurants.naverLink,
          })
          .from(restaurants)
          .where(whereClause)
          .orderBy(sql`${restaurants.walkingMinutes} asc nulls last`, desc(restaurants.createdAt))
          .limit(20);
      }

      return await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          rating: restaurants.rating,
          walkingMinutes: restaurants.walkingMinutes,
          imageUrl: restaurants.imageUrl,
          naverLink: restaurants.naverLink,
        })
        .from(restaurants)
        .orderBy(sql`${restaurants.walkingMinutes} asc nulls last`, desc(restaurants.createdAt))
        .limit(20);
    }

    if (whereClause) {
      return await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          rating: restaurants.rating,
          walkingMinutes: restaurants.walkingMinutes,
          imageUrl: restaurants.imageUrl,
          naverLink: restaurants.naverLink,
        })
        .from(restaurants)
        .where(whereClause)
        .orderBy(desc(restaurants.createdAt))
        .limit(20);
    }

    return await db
      .select({
        id: restaurants.id,
        name: restaurants.name,
        rating: restaurants.rating,
        walkingMinutes: restaurants.walkingMinutes,
        imageUrl: restaurants.imageUrl,
        naverLink: restaurants.naverLink,
      })
      .from(restaurants)
      .orderBy(desc(restaurants.createdAt), desc(restaurants.id))
      .limit(20);
  } catch (error) {
    console.error("Failed to load restaurants for home:", error);
    return [];
  }
}

export default async function HomePage({
  searchQuery = "",
  sortBy = "latest",
  minRating = 0,
  maxWalking = 0,
  mealType = "all",
}: HomePageProps) {
  const safeSort = toHomeSort(sortBy);
  const safeMealType = toHomeMealType(mealType);
  const restaurantList = await getHomeRestaurants({
    searchQuery,
    sortBy: safeSort,
    minRating,
    maxWalking,
    mealType: safeMealType,
  });

  return (
    <AppShell>
      <HomeHeader />
      <HeroSection />
      <RestaurantSection
        restaurants={restaurantList}
        searchKeyword={searchQuery}
        sortBy={safeSort}
        minRating={minRating}
        maxWalking={maxWalking}
        mealType={safeMealType}
      />
    </AppShell>
  );
}
