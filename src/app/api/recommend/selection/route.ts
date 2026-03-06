import { NextRequest, NextResponse } from "next/server";
import { eq } from "drizzle-orm";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";
import { dailyRestaurantSelections, restaurants } from "@/db/schema";

function getSeoulDateString(now: Date = new Date()) {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return formatter.format(now);
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await request.json()) as { restaurantId?: number | string };
    const restaurantId = Number(body.restaurantId);
    if (!Number.isInteger(restaurantId) || restaurantId <= 0) {
      return NextResponse.json(
        { error: "restaurantId is required" },
        { status: 400 },
      );
    }

    const restaurant = await db.query.restaurants.findFirst({
      where: eq(restaurants.id, restaurantId),
      columns: { id: true, name: true },
    });
    if (!restaurant) {
      return NextResponse.json({ error: "Restaurant not found" }, { status: 404 });
    }

    const selectedDate = getSeoulDateString();

    await db
      .insert(dailyRestaurantSelections)
      .values({
        userId: session.user.id,
        restaurantId,
        selectedDate,
      })
      .onConflictDoUpdate({
        target: [
          dailyRestaurantSelections.userId,
          dailyRestaurantSelections.selectedDate,
        ],
        set: {
          restaurantId,
          updatedAt: new Date(),
        },
      });

    return NextResponse.json({
      ok: true,
      restaurant: {
        id: restaurant.id,
        name: restaurant.name,
      },
      selectedDate,
    });
  } catch (error) {
    console.error("[POST /api/recommend/selection]", error);
    if (isMissingDailySelectionTableError(error)) {
      return NextResponse.json(
        { error: "선택 기능 초기화 중입니다. 잠시 후 다시 시도해 주세요." },
        { status: 503 },
      );
    }
    return NextResponse.json(
      { error: "선택 저장 중 오류가 발생했습니다." },
      { status: 500 },
    );
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
