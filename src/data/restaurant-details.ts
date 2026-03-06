import { notFound } from "next/navigation";
import { db } from "@/db/client";
import { restaurants, reviews, restaurantTags, tags, user } from "@/db/schema";
import { desc, eq } from "drizzle-orm";

export type ReviewRecord = {
  id: string;
  nickname: string;
  menu: string;
  rating: number;
  comment: string;
  userId: string;
};

export type InfoBlockRecord = {
  label: string;
  value: string;
  detail: string;
  linkUrl?: string;
  linkLabel?: string;
};

export type RestaurantDetailRecord = {
  id: string;
  slug: string;
  name: string;
  tagline: string;
  rating: number;
  reviewCount: number;
  naverLink: string;
  infoBlocks: InfoBlockRecord[];
  tags: string[];
  imageUrl: string | null;
  reviews: ReviewRecord[];
};

export async function getRestaurantDetail(
  slug: string,
): Promise<RestaurantDetailRecord> {
  const restaurantId = Number(slug);
  if (!Number.isFinite(restaurantId)) {
    notFound();
  }

  const restaurantRow = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantId),
  });

  if (!restaurantRow) {
    notFound();
  }

  const reviewRows = await db
  .select({
    uuid: reviews.uuid,
    rating: reviews.rating,
    menu: reviews.menu,
    comment: reviews.content,
    nickname: user.name,
    userId: reviews.userId,
  })
    .from(reviews)
    .leftJoin(user, eq(user.id, reviews.userId))
    .where(eq(reviews.restaurantId, restaurantRow.id))
    .orderBy(desc(reviews.createdAt))
    .limit(20);

  const tagRows = await db
    .select({
      name: tags.name,
    })
    .from(restaurantTags)
    .leftJoin(tags, eq(tags.id, restaurantTags.tagId))
    .where(eq(restaurantTags.restaurantId, restaurantRow.id));

  const infoBlocks: InfoBlockRecord[] = [];

  if (restaurantRow.recommendMenu) {
    infoBlocks.push({
      label: "추천 메뉴",
      value: restaurantRow.recommendMenu,
      detail: "시그니처 메뉴 및 세트",
    });
  }

  if (typeof restaurantRow.walkingMinutes === "number") {
    infoBlocks.push({
      label: "도보 시간",
      value: `${restaurantRow.walkingMinutes}분`,
      detail: "중심지에서 예상 도착 거리",
    });
  }

  if (restaurantRow.priceRange) {
    infoBlocks.push({
      label: "가격대",
      value: restaurantRow.priceRange,
      detail: "1인당 평균 예상 소비",
    });
  }

  if (restaurantRow.locationText) {
    infoBlocks.push({
      label: "위치",
      value: restaurantRow.locationText,
      detail: "지도를 열려면 눌러주세요",
      linkUrl: restaurantRow.naverLink || undefined,
      linkLabel: restaurantRow.naverLink ? "네이버 지도에서 보기" : undefined,
    });
  }

    const storedRating = restaurantRow.rating
      ? Number(restaurantRow.rating)
      : 0;
    const reviewAverage =
      reviewRows.length > 0
        ? reviewRows.reduce((sum, review) => sum + (review.rating ?? 0), 0) /
          reviewRows.length
        : storedRating;
    const rating = Number(reviewAverage.toFixed(1));

  const reviewsList: ReviewRecord[] = reviewRows.map((review) => ({
    id: review.uuid,
    nickname: review.nickname ?? "Guest",
    menu: review.menu ?? "",
    rating: review.rating ?? 0,
    comment: review.comment ?? "",
    userId: review.userId,
  }));

  const tagNames = tagRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: restaurantRow.id.toString(),
    slug,
    name: restaurantRow.name,
    tagline: restaurantRow.locationText ?? restaurantRow.name,
    rating,
    reviewCount: reviewsList.length,
    naverLink: restaurantRow.naverLink || "",
    infoBlocks,
    tags: tagNames,
    imageUrl: restaurantRow.imageUrl ?? null,
    reviews: reviewsList,
  };
}
