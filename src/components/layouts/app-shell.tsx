import type { ReactNode } from "react";
import AppHeader from "./app-header";
import DesktopNav from "./partials/nav/desktop-nav";

type AppShellProps = {
  children: ReactNode;
};

export default function AppShell({ children }: AppShellProps) {
  return (
    <div className="app-shell">
      <DesktopNav />
      <div>
        <AppHeader />
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
