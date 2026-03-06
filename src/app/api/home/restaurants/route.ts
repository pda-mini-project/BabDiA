import { NextResponse } from "next/server";
import { getHomeRestaurantsPage, type HomeMealType, type HomeSort } from "@/data/home-restaurants";

const PAGE_SIZE = 20;

function toHomeSort(sortBy: string | null): HomeSort {
  if (sortBy === "rating_desc" || sortBy === "walking_asc") return sortBy;
  return "latest";
}

function toHomeMealType(mealType: string | null): HomeMealType {
  if (
    mealType === "soup" ||
    mealType === "rice" ||
    mealType === "noodle" ||
    mealType === "rice_noodle"
  )
    return mealType as HomeMealType;
  return "all";
}

/** GET /api/home/restaurants?page=2&sortBy=latest&searchQuery=...&minRating=0&maxWalking=0&mealType=all */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
    const sortBy = toHomeSort(searchParams.get("sortBy"));
    const searchQuery = searchParams.get("searchQuery") ?? "";
    const minRating = Number(searchParams.get("minRating")) || 0;
    const maxWalking = Number(searchParams.get("maxWalking")) || 0;
    const mealType = toHomeMealType(searchParams.get("mealType"));

    const list = await getHomeRestaurantsPage({
      searchQuery,
      sortBy,
      minRating,
      maxWalking,
      mealType,
      limit: PAGE_SIZE,
      offset: (page - 1) * PAGE_SIZE,
    });

    return NextResponse.json({ restaurants: list, hasMore: list.length === PAGE_SIZE });
  } catch (err) {
    console.error("[GET /api/home/restaurants]", err);
    return NextResponse.json({ error: "목록 조회 실패" }, { status: 500 });
  }
}
