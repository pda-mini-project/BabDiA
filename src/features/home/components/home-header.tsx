export default function HomeHeader() {
  return (
    <header
      className="header"
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 24,
        gap: 16,
      }}
    >
      <div className="page-title" style={{ fontSize: 28, fontWeight: 900 }}>
        오늘 뭐 먹지? 🎲
      </div>

      <div
        className="header-actions"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        <button
          className="login-btn"
          type="button"
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 16px",
            borderRadius: 14,
            border: "1px solid var(--line, #e5e7eb)",
            background: "#fff",
            fontWeight: 900,
            cursor: "pointer",
          }}
        >
          <span className="icon" style={{ fontSize: 18 }}>
            👤
          </span>
          <span className="login-text">로그인 / 회원가입</span>
        </button>
      </div>
    </header>
  );
}
