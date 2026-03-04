"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems } from "./nav-items";

export default function DesktopNav() {
  const pathname = usePathname();

  return (
    <aside className="desktop-nav">
      <div className="logo">🍽️ 점메추</div>

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

      <div className="profile">
        👤 프디아김
        <br />
        Lv.3 점심 탐험가
      </div>
    </aside>
  );
}
