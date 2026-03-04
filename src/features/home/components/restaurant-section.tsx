const restaurantList = [
  "김치찌개집",
  "순대국집",
  "제육덮밥집",
  "라멘집",
  "샐러드집",
  "돈까스집",
];

export default function RestaurantSection() {
  return (
    <section className="section">
      <div
        className="list-header"
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 12,
          gap: 16,
        }}
      >
        <div
          className="section-title"
          style={{ fontWeight: 900, fontSize: 16, margin: 0 }}
        >
          🍽️ 식당 리스트
        </div>
      </div>

      <div
        className="search-row"
        style={{ display: "flex", gap: 10, marginBottom: 20 }}
      >
        <input
          className="search"
          placeholder="식당 검색..."
          style={{
            flex: 1,
            padding: "12px 16px",
            borderRadius: 12,
            border: "1px solid var(--line, #e5e7eb)",
            outline: "none",
            background: "#fff",
          }}
        />
        <button className="search-btn">검색</button>
      </div>

      <div
        className="restaurant-grid"
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gap: 24,
        }}
      >
        {restaurantList.map((name) => (
          <div
            key={name}
            className="restaurant-card"
            style={{
              borderRadius: 20,
              overflow: "hidden",
              border: "1px solid var(--line, #e5e7eb)",
              background: "#fff",
              boxShadow: "var(--shadow, 0 10px 30px rgba(0,0,0,0.05))",
              transition: "0.2s ease",
              cursor: "pointer",
            }}
          >
            <div
              className="restaurant-img"
              style={{ height: 160, background: "#e0e7ff" }}
            />
            <div className="restaurant-body" style={{ padding: 18 }}>
              <div
                className="restaurant-title"
                style={{ fontWeight: 900, marginBottom: 8 }}
              >
                {name}
              </div>
              <div
                className="meta"
                style={{ fontSize: 13, color: "var(--muted, #6b7280)" }}
              >
                ⭐ 4.5 · 도보 5분
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
