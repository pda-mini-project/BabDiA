import { db } from "@/db/client";
import { restaurantTags, restaurants, tags } from "@/db/schema";
import { eq } from "drizzle-orm";

export type RestaurantEditRecord = {
  id: string;
  name: string;
  category: string;
  priceRange: string;
  walkMinutes: string;
  naverLink: string;
  recommendMenu: string;
  locationText: string;
  selectedTags: string[];
};

export async function getRestaurantEditRecord(
  restaurantId: string,
): Promise<RestaurantEditRecord | null> {
  const restaurantIdNumber = Number(restaurantId);
  if (!Number.isFinite(restaurantIdNumber)) {
    return null;
  }

  const restaurantRow = await db.query.restaurants.findFirst({
    where: eq(restaurants.id, restaurantIdNumber),
  });

  if (!restaurantRow) {
    return null;
  }

  const tagRows = await db
    .select({ name: tags.name })
    .from(restaurantTags)
    .leftJoin(tags, eq(tags.id, restaurantTags.tagId))
    .where(eq(restaurantTags.restaurantId, restaurantRow.id));

  const selectedTags = tagRows
    .map((row) => row.name)
    .filter((name): name is string => Boolean(name));

  return {
    id: restaurantRow.id.toString(),
    name: restaurantRow.name,
    category: restaurantRow.category ?? "",
    priceRange: restaurantRow.priceRange ?? "",
    walkMinutes:
      typeof restaurantRow.walkingMinutes === "number"
        ? String(restaurantRow.walkingMinutes)
        : "",
    naverLink: restaurantRow.naverLink ?? "",
    recommendMenu: restaurantRow.recommendMenu ?? "",
    locationText: restaurantRow.locationText ?? "",
    selectedTags,
  };
}
