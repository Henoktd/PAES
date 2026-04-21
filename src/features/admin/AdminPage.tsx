import { useMemo } from "react";
import { useForm } from "react-hook-form";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FormActions } from "../../components/forms/FormActions";
import { FormField } from "../../components/forms/FormField";
import { FormSelect } from "../../components/forms/FormSelect";
import { moduleRoutes } from "../modules/moduleRegistry";
import { useAccessControl } from "./AccessControlContext";
import { roleDefinitions, roleOptions, type AppRole } from "./accessModel";

interface AccessFormValues {
  email: string;
  displayName: string;
  role: AppRole;
}

export function AdminPage() {
  const {
    assignments,
    currentRole,
    roleSource,
    entraRoles,
    canManageAccess,
    currentEmail,
    saveAssignment,
    removeAssignment,
  } = useAccessControl();
  const form = useForm<AccessFormValues>({
    defaultValues: {
      email: "",
      displayName: "",
      role: "viewer",
    },
  });

  const permissionRows = useMemo(
    () =>
      Object.entries(roleDefinitions).map(([roleKey, definition]) => ({
        roleKey,
        definition,
      })),
    [],
  );

  const onSubmit = form.handleSubmit((values) => {
    saveAssignment({
      email: values.email,
      displayName: values.displayName,
      role: values.role,
    });
    form.reset({
      email: "",
      displayName: "",
      role: "viewer",
    });
  });

  return (
    <div className="page">
      <div className="page__header">
        <div>
          <span className="eyebrow">Administration</span>
          <h1>Access & Roles</h1>
          <p>
            Demo-ready access management for team walkthroughs. For production enforcement, pair this
            with Microsoft Entra groups and Dataverse security roles.
          </p>
        </div>
      </div>

      <section className="dashboard-section-grid">
        <Card
          title="Current Access Profile"
          subtitle="Shows the role currently applied to the signed-in user."
        >
          <div className="metric-list">
            <article className="metric-list__item">
              <span>Signed-in user</span>
              <strong>{currentEmail || "Unknown user"}</strong>
            </article>
            <article className="metric-list__item">
              <span>Active role</span>
              <strong>{roleDefinitions[currentRole].label}</strong>
              <small>{roleDefinitions[currentRole].description}</small>
            </article>
            <article className="metric-list__item">
              <span>Role source</span>
              <strong>{roleSource === "entra" ? "Microsoft Entra" : roleSource === "local" ? "Local admin assignment" : "Default viewer"}</strong>
              {entraRoles.length > 0 ? <small>{entraRoles.join(", ")}</small> : null}
            </article>
            <article className="metric-list__item">
              <span>Admin access</span>
              <strong>{canManageAccess ? "Granted" : "Restricted"}</strong>
            </article>
          </div>
        </Card>

        <Card
          title="Role Assignment"
          subtitle="Use this panel to prepare a role-based team demo for operations, finance, and partner users."
        >
          <form className="form-grid" onSubmit={onSubmit}>
            <FormField
              label="Email"
              type="email"
              placeholder="user@paes.org"
              {...form.register("email", { required: true })}
            />
            <FormField
              label="Display Name"
              placeholder="Team member name"
              {...form.register("displayName")}
            />
            <FormSelect
              label="Role"
              options={roleOptions}
              placeholder="Select role"
              {...form.register("role", { required: true })}
            />
            <FormActions>
              <Button type="submit">Save assignment</Button>
            </FormActions>
          </form>
        </Card>
      </section>

      <Card title="Assigned Users" subtitle="Client-side role assignments used for the current demo build.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {assignments.map((assignment) => (
                <tr key={assignment.email}>
                  <td>{assignment.displayName || "Not set"}</td>
                  <td>{assignment.email}</td>
                  <td>{roleDefinitions[assignment.role].label}</td>
                  <td className="table-actions">
                    {assignment.email !== currentEmail ? (
                      <button
                        type="button"
                        className="action-button"
                        onClick={() => removeAssignment(assignment.email)}
                      >
                        Remove
                      </button>
                    ) : (
                      <span className="page__caption">Current user</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Security Notes" subtitle="How access works in the current build.">
        <div className="metric-list">
          <article className="metric-list__item">
            <span>App roles</span>
            <strong>{entraRoles.length > 0 ? "Enabled" : "Not detected"}</strong>
            <small>
              If the signed-in token includes Entra app roles such as <code>super_admin</code> or <code>operations_lead</code>, the app now honors them.
            </small>
          </article>
          <article className="metric-list__item">
            <span>Local assignments</span>
            <strong>Available</strong>
            <small>Used as a fallback for demos when Entra app roles are not yet configured.</small>
          </article>
          <article className="metric-list__item">
            <span>Dataverse security</span>
            <strong>Still required</strong>
            <small>Dataverse security roles should still be configured for true backend authorization.</small>
          </article>
        </div>
      </Card>

      <Card title="Role Matrix" subtitle="Suggested access model for the PAES team rollout.">
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Role</th>
                <th>Description</th>
                <th>Accessible Areas</th>
                <th>Create / Edit</th>
                <th>Delete</th>
              </tr>
            </thead>
            <tbody>
              {permissionRows.map(({ roleKey, definition }) => (
                <tr key={roleKey}>
                  <td>{definition.label}</td>
                  <td>{definition.description}</td>
                  <td>
                    {definition.modules
                      .map((moduleKey) =>
                        moduleKey === "dashboard"
                          ? "Dashboard"
                          : moduleKey === "admin"
                            ? "Admin"
                            : moduleRoutes.find((route) => route.key === moduleKey)?.label ?? moduleKey,
                      )
                      .join(", ")}
                  </td>
                  <td>{definition.canCreateEdit ? "Yes" : "No"}</td>
                  <td>{definition.canDelete ? "Yes" : "No"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
