import Sidebar from "../components/Sidebar";

export default function Home() {
  return (
    <div className="layout">
      <Sidebar />
      <main className="main">
        <div className="breadcrumb">홈 / 식당 리스트 / 상세</div>
        <h1 className="page-title">식당 상세</h1>
      </main>
    </div>
  );
}
