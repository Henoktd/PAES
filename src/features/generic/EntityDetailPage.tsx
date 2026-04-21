import { useQuery } from "@tanstack/react-query";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAccessControl } from "../admin/AccessControlContext";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";
import { ErrorState } from "../../components/ui/ErrorState";
import { LoadingState } from "../../components/ui/LoadingState";
import { useCrudResource, useCrudService } from "../../hooks/useCrudResource";
import { formatDate } from "../../lib/utils";
import type { BaseRecord, ModuleConfig } from "../../types/entities";

export function EntityDetailPage<TRecord extends BaseRecord>({
  moduleConfig,
}: {
  moduleConfig: ModuleConfig<TRecord>;
}) {
  const navigate = useNavigate();
  const { id = "" } = useParams();
  const { canCreateEdit, canDelete } = useAccessControl();
  const service = useCrudService(moduleConfig);
  const { deleteMutation } = useCrudResource(moduleConfig);

  const query = useQuery({
    queryKey: [moduleConfig.key, "detail", id],
    queryFn: () => service.getById(id),
    enabled: Boolean(id),
  });

  if (query.isLoading) {
    return <LoadingState label={`Loading ${moduleConfig.singularLabel.toLowerCase()}...`} />;
  }

  if (query.isError) {
    return (
      <ErrorState
        message={query.error instanceof Error ? query.error.message : "Unable to load record details."}
      />
    );
  }

  if (!query.data) {
    return <ErrorState title="Record not found" message="The requested record could not be loaded." />;
  }

  const record = query.data;

  const handleDelete = async () => {
    const confirmed = window.confirm(
      `Delete ${moduleConfig.singularLabel.toLowerCase()} "${record.name}"? This action cannot be undone from the app.`,
    );

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync(id);
    navigate(`/${moduleConfig.path}`);
  };

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <span className="eyebrow">{moduleConfig.singularLabel}</span>
          <h1>{record.name}</h1>
        </div>
        <div className="form-actions">
          {canCreateEdit(moduleConfig.key) ? (
            <Link className="text-link" to={`/${moduleConfig.path}/${id}/edit`}>
              Edit record
            </Link>
          ) : null}
          {canDelete(moduleConfig.key) ? (
            <Button variant="danger" onClick={() => void handleDelete()} disabled={deleteMutation.isPending}>
              Delete record
            </Button>
          ) : null}
        </div>
      </div>

      <Card title="Record Details" subtitle={getDetailSubtitle(moduleConfig.key)}>
        <dl className="detail-grid">
          {moduleConfig.detailFields.map((field) => (
            <div key={String(field.key)}>
              <dt>{field.label}</dt>
              <dd>
                {String(query.data?.[field.key] ?? "N/A")}
                
              </dd>
            </div>
          ))}
          <div>
            <dt>Created</dt>
            <dd>{formatDate(record.createdOn)}</dd>
          </div>
          <div>
            <dt>Last Modified</dt>
            <dd>{formatDate(record.modifiedOn)}</dd>
          </div>
        </dl>
      </Card>
    </div>
  );
}

function getDetailSubtitle(moduleKey: string) {
  const subtitles: Record<string, string> = {
    demand: "Review demand requirements, commercial assumptions, and delivery timing.",
    supply: "Review supply details, readiness expectations, and linked demand context.",
    readiness: "Review readiness evidence, blockers, and deployment suitability.",
    partners: "Review partner profile details, contacts, and operating status.",
    deployments: "Review deployment progress, placement volume, and revenue contribution.",
    learners: "Review learner profile details, linked training, and follow-up status.",
    courses: "Review course setup, delivery details, and pricing information.",
    payments: "Review transaction details, revenue source, and payment status.",
    events: "Review event planning details, totals, and commercial performance.",
    "event-registrations": "Review participant-level event registration details when detailed tracking is used.",
    certifications: "Review certification progress, cost, revenue, and demand linkage.",
  };

  return subtitles[moduleKey] ?? "Review the record, confirm values, and prepare follow-up actions.";
}
