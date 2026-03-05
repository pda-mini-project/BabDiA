import AppShell from "@/components/layouts/app-shell";
import { db } from "@/db/client";
import { restaurants } from "@/db/schema";
import { desc, ilike } from "drizzle-orm";
import HomeHeader from "./home-header";
import HeroSection from "./hero-section";
import RestaurantSection from "./restaurant-section";

type HomePageProps = {
  searchQuery?: string;
};

async function getHomeRestaurants(searchQuery: string) {
  const keyword = searchQuery.trim();

  try {
    if (keyword.length > 0) {
      return await db
        .select({
          id: restaurants.id,
          name: restaurants.name,
          rating: restaurants.rating,
          walkingMinutes: restaurants.walkingMinutes,
          imageUrl: restaurants.imageUrl,
        })
        .from(restaurants)
        .where(ilike(restaurants.name, `%${keyword}%`))
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
      })
      .from(restaurants)
      .orderBy(desc(restaurants.createdAt))
      .limit(20);
  } catch (error) {
    console.error("Failed to load restaurants for home:", error);
    return [];
  }
}

export default async function HomePage({ searchQuery = "" }: HomePageProps) {
  const restaurantList = await getHomeRestaurants(searchQuery);

  return (
    <AppShell>
      <HomeHeader />
      <HeroSection />
      <RestaurantSection
        restaurants={restaurantList}
        searchKeyword={searchQuery}
      />
    </AppShell>
  );
}
