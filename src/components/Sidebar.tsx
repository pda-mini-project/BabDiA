export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="logo">🍽️ 점메추</div>

      <nav className="nav">
        <div className="nav-item active">홈</div>
        <div className="nav-item">점메추</div>
        <div className="nav-item">식당 추가</div>
      </nav>

      <div className="profile">
        👤 프디아김
        <br />
        Lv.3 점심 탐험가
      </div>
    </aside>
  );
}
