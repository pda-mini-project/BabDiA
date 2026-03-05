import AppShell from "@/components/layouts/app-shell";
import RestaurantDetailView from "@/components/restaurant-detail/RestaurantDetailView";
import { getRestaurantDetail } from "@/data/restaurant-details";

type RestaurantPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function RestaurantPage({ params }: RestaurantPageProps) {
  const { restaurantId } = await params;
  const restaurant = getRestaurantDetail(restaurantId);

  return (
    <AppShell>
      <RestaurantDetailView restaurant={restaurant} />
    </AppShell>
  );
}
