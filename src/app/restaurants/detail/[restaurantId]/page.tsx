import AppShell from "@/components/layouts/app-shell";
import RestaurantDetailView from "@/components/restaurant-detail/RestaurantDetailView";
import { getRestaurantDetail } from "@/data/restaurant-details";

type RestaurantDetailPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantDetailPage({
  params,
}: RestaurantDetailPageProps) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantDetail(restaurantId);

  return (
    <AppShell>
      <RestaurantDetailView restaurant={restaurant} restaurantId={restaurant.id} />
    </AppShell>
  );
}
