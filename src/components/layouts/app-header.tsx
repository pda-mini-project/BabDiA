"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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
        <Link href="/" className="app-header-logo" style={{ textDecoration: "none", color: "inherit" }}>🍽️ 밥디아</Link>
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
