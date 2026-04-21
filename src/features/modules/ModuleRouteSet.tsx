import { Route, Routes } from "react-router-dom";
import { RequireAccess } from "../admin/RequireAccess";
import { EntityDetailPage } from "../generic/EntityDetailPage";
import { EntityFormPage } from "../generic/EntityFormPage";
import { EntityListPage } from "../generic/EntityListPage";
import type { BaseRecord, ModuleConfig } from "../../types/entities";

export function ModuleRouteSet<TRecord extends BaseRecord>({
  moduleConfig,
}: {
  moduleConfig: ModuleConfig<TRecord>;
}) {
  return (
    <Routes>
      <Route
        index
        element={
          <RequireAccess moduleKey={moduleConfig.key}>
            <EntityListPage moduleConfig={moduleConfig} />
          </RequireAccess>
        }
      />
      <Route
        path="new"
        element={
          <RequireAccess moduleKey={moduleConfig.key} permission="edit">
            <EntityFormPage moduleConfig={moduleConfig} />
          </RequireAccess>
        }
      />
      <Route
        path=":id"
        element={
          <RequireAccess moduleKey={moduleConfig.key}>
            <EntityDetailPage moduleConfig={moduleConfig} />
          </RequireAccess>
        }
      />
      <Route
        path=":id/edit"
        element={
          <RequireAccess moduleKey={moduleConfig.key} permission="edit">
            <EntityFormPage moduleConfig={moduleConfig} />
          </RequireAccess>
        }
      />
    </Routes>
  );
}
