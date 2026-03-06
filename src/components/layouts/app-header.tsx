"use client";

import { useEffect, useState } from "react";
import MobileNav from "./partials/nav/mobile-nav";

export default function AppHeader() {
  const [open, setOpen] = useState(false);

  // close mobile nav when resizing to wide screens
  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1100 && open) {
        setOpen(false);
      }
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [open]);

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
