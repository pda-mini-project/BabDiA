import AppShell from "@/components/layouts/app-shell";
import AddRestaurantForm from "@/components/restaurant-add/AddRestaurantForm";

export default function NewRestaurantPage() {
  return (
    <AppShell>
      <h1 className="page-title">식당 추가</h1>
      <p className="page-sub">기본 정보만 입력해도 등록할 수 있습니다.</p>
      <AddRestaurantForm />
    </AppShell>
  );
}
