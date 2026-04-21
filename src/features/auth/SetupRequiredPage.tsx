import { env } from "../../config/env";

export function SetupRequiredPage({ missingKeys }: { missingKeys: string[] }) {
  return (
    <div className="login-page">
      <section className="login-card">
        <span className="eyebrow">Environment Setup Required</span>
        <h1>{env.appName} needs tenant configuration before it can render the full app.</h1>
        <p>
          The preview was blank because the application could not find the required Microsoft
          Entra ID and Dataverse environment variables.
        </p>

        <div className="setup-panel">
          <h3>Missing variables</h3>
          <ul className="setup-list">
            {missingKeys.map((key) => (
              <li key={key}>
                <code>{key}</code>
              </li>
            ))}
          </ul>
        </div>

        <div className="setup-panel">
          <h3>Create a local <code>.env</code></h3>
          <pre className="code-block">
{`VITE_APP_NAME=PAES Reporting
VITE_ENTRA_TENANT_ID=your-tenant-id
VITE_ENTRA_CLIENT_ID=your-client-id
VITE_ENTRA_AUTHORITY=https://login.microsoftonline.com/your-tenant-id
VITE_DATAVERSE_URL=https://your-environment.crm.dynamics.com
VITE_DATAVERSE_SCOPE=https://your-environment.crm.dynamics.com/user_impersonation`}
          </pre>
        </div>

        <p>
          After creating <code>.env</code>, restart <code>npm run dev</code> and refresh the page.
        </p>
      </section>
    </div>
  );
}
