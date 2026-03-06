import { NextRequest, NextResponse } from "next/server";
import { and, eq } from "drizzle-orm";
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

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ restaurantName: null });
    }

    const selectedDate = getSeoulDateString();
    const row = await db
      .select({
        restaurantName: restaurants.name,
      })
      .from(dailyRestaurantSelections)
      .innerJoin(
        restaurants,
        eq(restaurants.id, dailyRestaurantSelections.restaurantId),
      )
      .where(
        and(
          eq(dailyRestaurantSelections.userId, session.user.id),
          eq(dailyRestaurantSelections.selectedDate, selectedDate),
        ),
      )
      .limit(1)
      .then((rows) => rows[0] ?? null);

    return NextResponse.json({
      restaurantName: row?.restaurantName ?? null,
    });
  } catch (error) {
    console.error("[GET /api/recommend/selection/today]", error);
    return NextResponse.json({ restaurantName: null }, { status: 200 });
  }
}
