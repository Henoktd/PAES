import { useEffect } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useNavigate } from "react-router-dom";
import { loginRequest } from "../../config/msal";
import { Button } from "../../components/ui/Button";

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
      <section className="login-simple">
        <div className="login-simple__logo">
          <img src="/brand/paes-logo-vertical.png" alt="PAES logo" />
        </div>

        <span className="eyebrow">PAES Platform</span>
        <h1>One workspace for PAES operations and reporting.</h1>
        <p>
          Manage demand, supply, readiness, deployment, events, certification, and revenue with a
          single secure sign-in.
        </p>

        <div className="login-simple__actions">
          <Button onClick={() => void instance.loginRedirect(loginRequest)}>Sign in</Button>
        </div>

        <div className="login-simple__meta">
          <span>Secure organizational access</span>
          <span>Role-based workspace</span>
        </div>
      </section>
    </div>
  );
}
