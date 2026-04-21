import { useState, type PropsWithChildren } from "react";
import { Sidebar } from "./Sidebar";
import { Topbar } from "./Topbar";

export function AppShell({ children }: PropsWithChildren) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="app-shell">
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <div className="app-shell__main">
        <Topbar onMenuToggle={() => setIsSidebarOpen((current) => !current)} />
        <main className="app-shell__content">{children}</main>
      </div>
    </div>
  );
}
