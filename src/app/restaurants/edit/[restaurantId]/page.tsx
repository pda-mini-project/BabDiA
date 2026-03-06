import { notFound } from "next/navigation";
import AppShell from "@/components/layouts/app-shell";
import EditRestaurantForm from "@/components/restaurant-add/EditRestaurantForm";
import { getRestaurantEditRecord } from "@/data/restaurant-edit";

type EditRestaurantPageProps = {
  params: Promise<{
    restaurantId: string;
  }>;
};

export default async function EditRestaurantPage({
  params,
}: EditRestaurantPageProps) {
  const { restaurantId } = await params;
  const restaurant = await getRestaurantEditRecord(restaurantId);

  if (!restaurant) {
    notFound();
  }

  return (
    <AppShell>
      <div style={{ maxWidth: 720, margin: "0 auto", width: "100%" }}>
        <h1 className="page-title">식당 수정</h1>
        <p className="page-sub">기존 정보를 수정할 수 있습니다.</p>
      </div>
      <EditRestaurantForm restaurantId={restaurant.id} initialData={restaurant} />
    </AppShell>
  );
}
