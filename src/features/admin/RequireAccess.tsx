import { Navigate } from "react-router-dom";
import type { PropsWithChildren } from "react";
import { useAccessControl } from "./AccessControlContext";

export function RequireAccess({
  moduleKey,
  permission = "view",
  children,
}: PropsWithChildren<{ moduleKey: string; permission?: "view" | "edit" | "delete" }>) {
  const { canAccess, canCreateEdit, canDelete } = useAccessControl();

  const allowed =
    permission === "view"
      ? canAccess(moduleKey)
      : permission === "edit"
        ? canCreateEdit(moduleKey)
        : canDelete(moduleKey);

  if (!allowed) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
}
