import { NavLink, useLocation } from "react-router-dom";
import {
  BookOpen,
  Briefcase,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  MapPinned,
  Building2,
  Users,
  Wallet,
  X,
} from "lucide-react";
import { useEffect } from "react";
import { env } from "../../config/env";
import { useAccessControl } from "../../features/admin/AccessControlContext";
import { moduleRoutes } from "../../features/modules/moduleRegistry";

const icons = {
  layout: LayoutDashboard,
  briefcase: Briefcase,
  users: Users,
  building: Building2,
  map: MapPinned,
  graduation: GraduationCap,
  book: BookOpen,
  wallet: Wallet,
  calendar: CalendarRange,
};

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = false, onClose }: SidebarProps) {
  const { visibleModuleKeys } = useAccessControl();
  const location = useLocation();

  useEffect(() => {
    onClose?.();
  }, [location.pathname, onClose]);

  return (
    <>
      <div
        className={`sidebar-backdrop${isOpen ? " sidebar-backdrop--visible" : ""}`}
        onClick={onClose}
        aria-hidden={!isOpen}
      />
      <aside className={`sidebar${isOpen ? " sidebar--open" : ""}`}>
        <button type="button" className="sidebar__close" onClick={onClose} aria-label="Close navigation">
          <X size={18} />
        </button>
      <div className="sidebar__brand">
        <div className="sidebar__logo sidebar__logo--image">
          <img src="/brand/paes-logo-vertical.png" alt="PAES logo" />
        </div>
        <div>
          <strong>{env.appName}</strong>
          <p>Pan Africa Education & Skills management platform</p>
        </div>
      </div>

      <nav className="sidebar__nav">
        <NavLink to="/dashboard" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
          <LayoutDashboard size={18} />
          <span>Dashboard</span>
        </NavLink>

        {moduleRoutes
          .filter((moduleConfig) => visibleModuleKeys.includes(moduleConfig.key))
          .map((moduleConfig) => {
          const Icon = icons[moduleConfig.icon];
          return (
            <NavLink
              key={moduleConfig.key}
              to={`/${moduleConfig.path}`}
              className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
            >
              <Icon size={18} />
              <span>{moduleConfig.label}</span>
            </NavLink>
          );
          })}

      </nav>

      <div className="sidebar__footer">
        <p>Built for operational visibility, partner coordination, and management reporting.</p>
      </div>
      </aside>
    </>
  );
}
