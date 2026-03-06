"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth/auth-client";

export default function HomeHeader() {
  const router = useRouter();
  const { data: session } = authClient.useSession();

  const nickname = session?.user?.name ?? "";
  const isLoggedIn = Boolean(session?.user);

  const handleLogout = async () => {
    await authClient.signOut();
    router.refresh();
  };

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
      <div className="page-title">
        오늘 뭐 먹지? 🎲
      </div>

      <div
        className="header-actions"
        style={{ display: "flex", alignItems: "center", gap: 10 }}
      >
        {isLoggedIn ? (
          <>
            <div
              style={{
                fontSize: 14,
                fontWeight: 800,
                color: "var(--muted, #6b7280)",
              }}
            >
              <span style={{ color: "var(--text, #111827)" }}>
                {nickname}
              </span>
              님, 오늘도 맛있는 점심 드세요!
            </div>
            <button
              className="login-btn"
              type="button"
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                padding: "8px 12px",
                borderRadius: 12,
                border: "1px solid var(--line, #e5e7eb)",
                background: "#fff",
                fontWeight: 900,
                fontSize: 13,
                cursor: "pointer",
              }}
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            className="login-btn"
            type="button"
            onClick={() => {
              router.push("/login");
            }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              padding: "8px 12px",
              borderRadius: 12,
              border: "1px solid var(--line, #e5e7eb)",
              background: "#fff",
              fontWeight: 900,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            <span className="icon" style={{ fontSize: 18 }}>
              👤
            </span>
            <span className="login-text">로그인 / 회원가입</span>
          </button>
        )}
      </div>
    </header>
  );
}
