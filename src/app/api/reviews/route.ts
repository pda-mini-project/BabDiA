import { reviews } from "@/db/schema/review.schema";
import { restaurants } from "@/db/schema/restaurant.schema";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";
import { eq, sql } from "drizzle-orm";
import { randomUUID } from "crypto";
import { revalidatePath } from "next/cache";
import { NextRequest, NextResponse } from "next/server";

async function syncRestaurantRating(
  tx: Parameters<Parameters<typeof db.transaction>[0]>[0],
  restaurantIdNumber: number,
) {
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
}

function revalidateRestaurantPages(restaurantIdNumber: number) {
  revalidatePath("/");
  revalidatePath(`/restaurants/detail/${restaurantIdNumber}`);
}

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

      await syncRestaurantRating(tx, restaurantIdNumber);

      return inserted;
    });
    revalidateRestaurantPages(restaurantIdNumber);

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Review creation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uuid, rating, menu, content } = await request.json();

    if (!uuid || !rating || !content) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const ratingNumber = Number(rating);
    if (!Number.isInteger(ratingNumber)) {
      return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
    }

    const existing = await db.query.reviews.findFirst({
      where: eq(reviews.uuid, uuid),
    });

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.transaction(async (tx) => {
      await tx
        .update(reviews)
        .set({
          rating: ratingNumber,
          menu: menu || null,
          content,
        })
        .where(eq(reviews.uuid, uuid));

      await syncRestaurantRating(tx, Number(existing.restaurantId));
    });
    revalidateRestaurantPages(Number(existing.restaurantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review update error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session || !session.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { uuid } = await request.json();

    if (!uuid) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 },
      );
    }

    const existing = await db.query.reviews.findFirst({
      where: eq(reviews.uuid, uuid),
    });

    if (!existing) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    if (existing.userId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.transaction(async (tx) => {
      await tx.delete(reviews).where(eq(reviews.uuid, uuid));
      await syncRestaurantRating(tx, Number(existing.restaurantId));
    });
    revalidateRestaurantPages(Number(existing.restaurantId));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Review delete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
