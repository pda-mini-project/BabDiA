import { reviews } from "@/db/schema/review.schema";
import { db } from "@/db/client";
import { auth } from "@/lib/auth";
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

    const result = await db.insert(reviews).values({
      restaurantId: parseInt(restaurantId),
      userId: session.user.id,
      uuid: randomUUID(),
      rating: parseInt(rating),
      menu: menu || null,
      content,
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
