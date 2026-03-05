export type NavItem = {
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { label: "홈", href: "/" },
  { label: "점메추", href: "/recommend" },
  { label: "식당 추가", href: "/restaurants/new" },
];
