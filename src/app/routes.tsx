import { Navigate, RouterProvider, createBrowserRouter } from "react-router-dom";
import { LoginPage } from "../features/auth/LoginPage";
import { ProtectedRoute } from "../features/auth/ProtectedRoute";
import { RequireAccess } from "../features/admin/RequireAccess";
import { DashboardPage } from "../features/dashboard/pages/DashboardPage";
import { DemandDetailPage } from "../features/demand/pages/DemandDetailPage";
import { DemandFormPage } from "../features/demand/pages/DemandFormPage";
import { DemandListPage } from "../features/demand/pages/DemandListPage";
import { ModuleRouteSet } from "../features/modules/ModuleRouteSet";
import { moduleRoutes } from "../features/modules/moduleRegistry";
import { SupplyDetailPage } from "../features/supply/pages/SupplyDetailPage";
import { SupplyFormPage } from "../features/supply/pages/SupplyFormPage";
import { SupplyListPage } from "../features/supply/pages/SupplyListPage";

const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  {
    path: "/",
    element: <ProtectedRoute />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: "dashboard",
        element: (
          <RequireAccess moduleKey="dashboard">
            <DashboardPage />
          </RequireAccess>
        ),
      },
      {
        path: "demand",
        children: [
          {
            index: true,
            element: (
              <RequireAccess moduleKey="demand">
                <DemandListPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess moduleKey="demand" permission="edit">
                <DemandFormPage />
              </RequireAccess>
            ),
          },
          {
            path: ":id",
            element: (
              <RequireAccess moduleKey="demand">
                <DemandDetailPage />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess moduleKey="demand" permission="edit">
                <DemandFormPage />
              </RequireAccess>
            ),
          },
        ],
      },
      {
        path: "supply",
        children: [
          {
            index: true,
            element: (
              <RequireAccess moduleKey="supply">
                <SupplyListPage />
              </RequireAccess>
            ),
          },
          {
            path: "new",
            element: (
              <RequireAccess moduleKey="supply" permission="edit">
                <SupplyFormPage />
              </RequireAccess>
            ),
          },
          {
            path: ":id",
            element: (
              <RequireAccess moduleKey="supply">
                <SupplyDetailPage />
              </RequireAccess>
            ),
          },
          {
            path: ":id/edit",
            element: (
              <RequireAccess moduleKey="supply" permission="edit">
                <SupplyFormPage />
              </RequireAccess>
            ),
          },
        ],
      },
      ...moduleRoutes
        .filter((moduleConfig) => moduleConfig.key !== "demand" && moduleConfig.key !== "supply")
        .map((moduleConfig) => ({
        path: `${moduleConfig.path}/*`,
        element: <ModuleRouteSet moduleConfig={moduleConfig} />,
      })),
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);

export function AppRouter() {
  return <RouterProvider router={router} />;
}
