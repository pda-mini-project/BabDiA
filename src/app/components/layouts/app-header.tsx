"use client";

import { useState } from "react";
import MobileNav from "./partials/nav/mobile-nav";

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <header className="app-header">
        <div className="app-header-logo">🍽️ 점메추</div>
        <button
          type="button"
          className="menu-btn"
          onClick={() => setOpen((prev) => !prev)}
          aria-label="메뉴 열기"
        >
          ☰
        </button>
      </header>
      <MobileNav open={open} onClose={() => setOpen(false)} />
    </>
  );
}
