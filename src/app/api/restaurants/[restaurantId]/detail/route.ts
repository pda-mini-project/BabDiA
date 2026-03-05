import { NextResponse } from "next/server";
import { getRestaurantDetail } from "@/data/restaurant-details";

type RouteParams = { params: Promise<{ restaurantId: string }> };

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { restaurantId } = await params;
    if (!restaurantId) {
      return NextResponse.json({ error: "restaurantId required" }, { status: 400 });
    }
    const restaurant = await getRestaurantDetail(restaurantId);
    return NextResponse.json(restaurant);
  } catch (err) {
    console.error("[GET /api/restaurants/[restaurantId]/detail]", err);
    return NextResponse.json(
      { error: "상세 정보를 불러오지 못했습니다." },
      { status: 500 },
    );
  }
}
