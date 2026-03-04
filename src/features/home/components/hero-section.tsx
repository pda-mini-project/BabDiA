"use client";

import { useEffect, useRef, useState } from "react";

// 테스트용: 리셋 시간 설정 (시, 분)
const RESET_HOUR = 11;
const RESET_MIN = 40;

function nextResetTime() {
  const now = new Date();
  const t = new Date(now);
  t.setHours(RESET_HOUR, RESET_MIN, 0, 0); // 리셋 시간
  if (now.getTime() >= t.getTime()) {
    // 이미 지났으면 다음 날로
    t.setDate(t.getDate() + 1);
  }
  return t;
}

function remainingToReset() {
  const now = new Date();
  const todayReset = new Date(now);
  todayReset.setHours(RESET_HOUR, RESET_MIN, 0, 0);

  const diff = todayReset.getTime() - now.getTime();
  if (diff > 0) return diff;

  // 리셋 직후 1초는 00:00:00을 유지해서 이벤트 트리거 타이밍 확보
  if (diff > -1000) return 0;

  return Math.max(0, nextResetTime().getTime() - now.getTime());
}

function formatMS(ms: number) {
  if (ms <= 0) return "00:00:00";
  const total = Math.floor(ms / 1000);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(hrs)}:${pad(mins)}:${pad(secs)}`;
}

export default function HeroSection() {
  // SSR/CSR 초기 렌더를 동일하게 맞춰 hydration mismatch 방지
  const [left, setLeft] = useState(0);
  const firedRef = useRef(false);

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

  useEffect(() => {
    const updateLeft = () => {
      const rem = remainingToReset();
      setLeft(rem);

      if (rem <= 0 && !firedRef.current) {
        firedRef.current = true;
        if (typeof window !== "undefined") {
          import("@hiseb/confetti").then(({ default: confetti }) => {
            confetti({
              // count: 180,
              // size: 2.8,
              // velocity: 8,
              // fade: true,
              // position: { x: 0.5, y: 0.5 },
            });
          });
        }
      } else if (rem > 0) {
        firedRef.current = false;
      }
    };

    // 매초 업데이트
    const id = setInterval(() => {
      updateLeft();
    }, 1000);

    // mount 직후 비동기로 1회 동기화
    const t = setTimeout(updateLeft, 0);

    return () => {
      clearInterval(id);
      clearTimeout(t);
    };
  }, []);

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
            {formatMS(left)}
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
