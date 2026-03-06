import {
  getHomeRestaurantsCount,
  getHomeRestaurantsPage,
  type HomeMealType,
  type HomeSort,
} from "@/data/home-restaurants";
import AppShell from "@/components/layouts/app-shell";
import HomeHeader from "./home-header";
import HeroSection from "./hero-section";
import RestaurantSection from "./restaurant-section";

const HOME_PAGE_SIZE = 20;

type HomePageProps = {
  searchQuery?: string;
  sortBy?: string;
  minRating?: number;
  maxWalking?: number;
  mealType?: string;
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

export default async function HomePage({
  searchQuery = "",
  sortBy = "latest",
  minRating = 0,
  maxWalking = 0,
  mealType = "all",
}: HomePageProps) {
  const safeSort = toHomeSort(sortBy);
  const safeMealType = toHomeMealType(mealType);
  const [restaurantList, totalCount] = await Promise.all([
    getHomeRestaurantsPage({
      searchQuery,
      sortBy: safeSort,
      minRating,
      maxWalking,
      mealType: safeMealType,
      limit: HOME_PAGE_SIZE,
      offset: 0,
    }),
    getHomeRestaurantsCount({
      searchQuery,
      minRating,
      maxWalking,
      mealType: safeMealType,
    }),
  ]);

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
        pageSize={HOME_PAGE_SIZE}
        totalCount={totalCount}
      />
    </AppShell>
  );
}
