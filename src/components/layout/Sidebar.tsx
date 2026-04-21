import { NavLink } from "react-router-dom";
import {
  ShieldCheck,
  BookOpen,
  Briefcase,
  CalendarRange,
  GraduationCap,
  LayoutDashboard,
  MapPinned,
  Building2,
  Users,
  Wallet,
} from "lucide-react";
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

export function Sidebar() {
  const { visibleModuleKeys, canManageAccess } = useAccessControl();

  return (
    <aside className="sidebar">
      <div className="sidebar__brand">
        <div className="sidebar__logo sidebar__logo--image">
          <img src="/brand/paes-logo-vertical.png" alt="PAES logo" />
        </div>
        <div>
          <strong>{env.appName}</strong>
          <p>Pan Africa Education & Skills operations platform</p>
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

        {canManageAccess ? (
          <NavLink to="/admin" className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}>
            <ShieldCheck size={18} />
            <span>Admin</span>
          </NavLink>
        ) : null}
      </nav>

      <div className="sidebar__footer">
        <p>Built for operational visibility, partner coordination, and management reporting.</p>
      </div>
    </aside>
  );
}
