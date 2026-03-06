"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="desktop-nav">
      <Link href="/" className="logo" style={{ textDecoration: "none", color: "inherit" }}>🍽️ 밥디아</Link>

      <nav className="nav">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`nav-item nav-link ${pathname === item.href ? "active" : ""}`}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
