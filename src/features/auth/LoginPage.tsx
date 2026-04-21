import { useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../config/msal";
import { Button } from "../../components/ui/Button";
import { env } from "../../config/env";

export function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  return (
    <div className="login-page">
      <section className="login-card">
        <span className="eyebrow">PAES Reporting</span>
        <div className="login-card__brand">
          <img src="/brand/paes-logo-vertical.png" alt="PAES logo" />
        </div>
        <h1>Manage demand, supply, readiness, deployment, revenue, events, and certification in one place.</h1>
        <p>
          Sign in with Microsoft Entra ID to access the PAES workspace for operations,
          partner coordination, and executive reporting.
        </p>
        <Button onClick={() => void instance.loginRedirect(loginRequest)}>Sign in to {env.appName}</Button>
      </section>
    </div>
  );
}
