import { Link, useNavigate } from "react-router-dom";
import { DataTable } from "../../components/data/DataTable";
import { useAccessControl } from "../admin/AccessControlContext";
import { Button } from "../../components/ui/Button";
import { EmptyState } from "../../components/ui/EmptyState";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useCrudResource } from "../../hooks/useCrudResource";
import type { BaseRecord, ModuleConfig } from "../../types/entities";

export function EntityListPage<TRecord extends BaseRecord>({
  moduleConfig,
}: {
  moduleConfig: ModuleConfig<TRecord>;
}) {
  const navigate = useNavigate();
  const { canCreateEdit } = useAccessControl();
  const { listQuery } = useCrudResource(moduleConfig);

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <span className="eyebrow">{moduleConfig.label}</span>
          <h1>{moduleConfig.label}</h1>
        </div>
        {canCreateEdit(moduleConfig.key) ? (
          <Button onClick={() => navigate(`/${moduleConfig.path}/new`)}>Create {moduleConfig.singularLabel}</Button>
        ) : null}
      </div>

      {listQuery.isLoading ? <LoadingState /> : null}
      {listQuery.isError ? (
        <ErrorState message={listQuery.error instanceof Error ? listQuery.error.message : "Unable to load records."} />
      ) : null}
      {!listQuery.isLoading && !listQuery.isError && listQuery.data?.length === 0 ? (
        <EmptyState
          title={`No ${moduleConfig.label.toLowerCase()} yet`}
          description={`Create the first ${moduleConfig.singularLabel.toLowerCase()} record to get started.`}
          actionLabel={`Create ${moduleConfig.singularLabel}`}
          onAction={canCreateEdit(moduleConfig.key) ? () => navigate(`/${moduleConfig.path}/new`) : undefined}
        />
      ) : null}
      {listQuery.data && listQuery.data.length > 0 ? (
        <>
          <DataTable moduleConfig={moduleConfig} rows={listQuery.data} />
          <p className="page__caption">
            {getListCaption(moduleConfig.key)}
            <Link to="/dashboard"> Back to dashboard</Link>
          </p>
        </>
      ) : null}
    </div>
  );
}

function getListCaption(moduleKey: string) {
  const captions: Record<string, string> = {
    demand: "Open a demand record to confirm hiring requirements, commercial value, or planned start dates.",
    supply: "Open a supply record to review candidate readiness, partner alignment, or regional availability.",
    readiness: "Open a readiness record to check blockers, qualification status, or deployment preparedness.",
    partners: "Open a partner record to review delivery scope, contacts, and relationship status.",
    deployments: "Open a deployment record to verify launch progress, numbers deployed, and revenue outcomes.",
    learners: "Open a learner record to review training linkage, status, and follow-up actions.",
    courses: "Open a course record to review category, delivery setup, and commercial details.",
    payments: "Open a payment record to verify amount, revenue source, and collection status.",
    events: "Open an event record to review planning details, attendance totals, and event revenue.",
    "event-registrations": "Open a registration record only when participant-level attendance or payment tracking is required.",
    certifications: "Open a certification record to review progress, costs, and completion status.",
  };

  return captions[moduleKey] ?? "Open a record to review details and keep information current.";
}
