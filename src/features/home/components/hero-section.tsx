"use client";

import { useState } from "react";

export default function HeroSection() {
  const [selectedRestaurant] = useState<string | null>(null);

  const handleSpinClick = () => {
    const restaurants = [
      "김치찌개집",
      "순대국집",
      "제육덮밥집",
      "라멘집",
      "샐러드집",
      "돈까스집",
    ];
    const randomIdx = Math.floor(Math.random() * restaurants.length);
    // TODO: 추후 추천 결과 표시 구현
    console.log("추천:", restaurants[randomIdx]);
  };

  return (
    <section className="section" style={{ marginBottom: 48 }}>
      <div
        className="hero hero-center"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: 44,
          borderRadius: 24,
          gap: 40,
          background: "linear-gradient(135deg, #eef2ff, #ffffff)",
        }}
      >
        <div
          className="hero-centerbox"
          style={{
            width: "100%",
            maxWidth: 720,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            textAlign: "center",
            gap: 10,
          }}
        >
          <h2 style={{ fontSize: 24, margin: 0, fontWeight: 900 }}>
            🌧️ 오늘은 국물 땡기는 날
          </h2>

          <div
            className="countdown-label"
            style={{
              marginTop: 6,
              fontSize: 14,
              color: "var(--muted, #6b7280)",
              fontWeight: 800,
            }}
          >
            점심까지 남은 시간
          </div>

          <div
            className="countdown"
            style={{
              marginTop: 4,
              fontSize: 64,
              fontWeight: 950,
              letterSpacing: "1.5px",
              lineHeight: 1,
            }}
          >
            00:24:18
          </div>

          <button
            className="main-cta"
            type="button"
            onClick={handleSpinClick}
            style={{
              marginTop: 10,
              width: "min(520px, 100%)",
              padding: "20px 34px",
              border: "none",
              borderRadius: 22,
              background: "linear-gradient(135deg, #4f46e5, #6366f1)",
              color: "#fff",
              fontWeight: 950,
              fontSize: 20,
              cursor: "pointer",
            }}
          >
            🎰 지금 점메추 돌리기
          </button>
        </div>
      </div>
    </section>
  );
}
