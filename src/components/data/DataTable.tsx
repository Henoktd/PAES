import { Link } from "react-router-dom";
import { useAccessControl } from "../../features/admin/AccessControlContext";
import { useCrudResource } from "../../hooks/useCrudResource";
import { StatusBadge } from "../ui/StatusBadge";
import type { BaseRecord, ModuleConfig } from "../../types/entities";

interface DataTableProps<TRecord extends BaseRecord> {
  moduleConfig: ModuleConfig<TRecord>;
  rows: TRecord[];
}

export function DataTable<TRecord extends BaseRecord>({
  moduleConfig,
  rows,
}: DataTableProps<TRecord>) {
  const { canCreateEdit, canDelete } = useAccessControl();
  const { deleteMutation } = useCrudResource(moduleConfig);

  const handleDelete = async (record: TRecord) => {
    const confirmed = window.confirm(
      `Delete ${moduleConfig.singularLabel.toLowerCase()} "${record.name}"? This action cannot be undone from the app.`,
    );

    if (!confirmed) {
      return;
    }

    await deleteMutation.mutateAsync(record.id);
  };

  return (
    <div className="table-wrap">
      <table className="data-table">
        <thead>
          <tr>
            {moduleConfig.columns.map((column) => (
              <th key={String(column.key)}>{column.label}</th>
            ))}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id}>
              {moduleConfig.columns.map((column) => {
                const value = row[column.key];
                return (
                  <td key={String(column.key)}>
                    {column.key === "status" ? (
                      <StatusBadge status={String(value)} />
                    ) : (
                      String(value ?? "N/A")
                    )}
                  </td>
                );
              })}
              <td>
                <div className="table-actions">
                  <Link to={`/${moduleConfig.path}/${row.id}`}>View</Link>
                  {canCreateEdit(moduleConfig.key) ? (
                    <Link to={`/${moduleConfig.path}/${row.id}/edit`}>Edit</Link>
                  ) : null}
                  {canDelete(moduleConfig.key) ? (
                    <button
                      type="button"
                      className="action-button"
                      onClick={() => void handleDelete(row)}
                      disabled={deleteMutation.isPending}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
