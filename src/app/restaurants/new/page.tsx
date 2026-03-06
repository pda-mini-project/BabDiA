import AppShell from "@/components/layouts/app-shell";
import AddRestaurantForm from "@/components/restaurant-add/AddRestaurantForm";

export default function NewRestaurantPage() {
  return (
    <AppShell>
      <div style={{ maxWidth: 800, margin: "0 auto", width: "100%" }}>
        <h1 className="page-title">식당 추가</h1>
        <p className="page-sub">기본 정보만 입력해도 등록할 수 있습니다.</p>
      </div>
      <AddRestaurantForm />
    </AppShell>
  );
}
