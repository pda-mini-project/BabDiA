"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const menus = [
  { label: "홈", href: "/" },
  { label: "점메추", href: "/recommend" },
  { label: "식당 추가", href: "/restaurants/new" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="sidebar">
      <div className="logo">🍽️ 점메추</div>

      <nav className="nav">
        {menus.map((menu) => (
          <Link
            key={menu.href}
            href={menu.href}
            className={`nav-item nav-link ${pathname === menu.href ? "active" : ""}`}
          >
            {menu.label}
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
