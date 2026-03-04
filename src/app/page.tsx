import AppShell from "./components/layouts/app-shell";

export default function Home() {
  return (
    <AppShell>
      <div className="breadcrumb">홈 / 식당 리스트 / 상세</div>
      <h1 className="page-title">식당 상세</h1>
    </AppShell>
  );
}
