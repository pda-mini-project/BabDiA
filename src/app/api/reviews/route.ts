import { reviews } from "@/db/schema/review.schema";
import { restaurants } from "@/db/schema/restaurant.schema";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { restaurantId, rating, menu, content } = await request.json();

    if (!restaurantId || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const restaurantIdNumber = Number(restaurantId);
    const ratingNumber = Number(rating);

    if (!Number.isInteger(restaurantIdNumber) || !Number.isInteger(ratingNumber)) {
      return NextResponse.json({ error: "Invalid field types" }, { status: 400 });
    }

    const result = await db.transaction(async (tx) => {
      const inserted = await tx.insert(reviews).values({
        restaurantId: restaurantIdNumber,
        userId: session.user.id,
        uuid: randomUUID(),
        rating: ratingNumber,
        menu: menu || null,
        content,
      });

      const [averageRow] = await tx
        .select({
          averageRating: sql<string | null>`round(avg(${reviews.rating})::numeric, 1)`,
        })
        .from(reviews)
        .where(eq(reviews.restaurantId, restaurantIdNumber));

      await tx
        .update(restaurants)
        .set({
          rating: averageRow?.averageRating ?? "0.0",
        })
        .where(eq(restaurants.id, restaurantIdNumber));

      return inserted;
    });

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
