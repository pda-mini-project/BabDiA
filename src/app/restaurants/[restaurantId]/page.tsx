import { getRestaurantDetail } from "@/data/restaurant-details";
import { redirect } from "next/navigation";

type RestaurantRedirectPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantRedirectPage({
  params,
}: RestaurantRedirectPageProps) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantDetail(restaurantId);

  redirect(`/restaurants/detail/${restaurant.id}`);
}
