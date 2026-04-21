import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useIsAuthenticated } from "@azure/msal-react";
import { AppShell } from "../../components/layout/AppShell";
import { DataverseProvider } from "../../services/dataverse/DataverseContext";
import { AccessControlProvider } from "../admin/AccessControlContext";

export function ProtectedRoute() {
  const isAuthenticated = useIsAuthenticated();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return (
    <DataverseProvider>
      <AccessControlProvider>
        <AppShell>
          <Outlet />
        </AppShell>
      </AccessControlProvider>
    </DataverseProvider>
  );
}
