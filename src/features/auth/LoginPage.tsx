import { useEffect, useMemo, useState } from "react";
import { useIsAuthenticated, useMsal } from "@azure/msal-react";
import { useLocation, useNavigate } from "react-router-dom";
import { loginRequest } from "../../config/msal";
import { Button } from "../../components/ui/Button";
import {
  initializeHostEnvironmentWithRetry,
  isEmbeddedExperience,
} from "./hostEnvironment";

interface LoginLocationState {
  from?: string;
}

export function LoginPage() {
  const isAuthenticated = useIsAuthenticated();
  const { instance } = useMsal();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isTeamsHost, setIsTeamsHost] = useState(false);

  const returnPath = useMemo(() => {
    const state = location.state as LoginLocationState | null;
    return state?.from || "/";
  }, [location.state]);

  useEffect(() => {
    if (isAuthenticated) {
      navigate(returnPath, { replace: true });
    }
  }, [isAuthenticated, navigate, returnPath]);

  useEffect(() => {
    let cancelled = false;

    void initializeHostEnvironmentWithRetry(1, 800).then((runningInTeams) => {
      if (!cancelled) {
        setIsTeamsHost(runningInTeams);
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSignIn() {
    setIsSigningIn(true);
    setLoginError(null);

    try {
      const embedded = isEmbeddedExperience();
      const runningInTeams = await initializeHostEnvironmentWithRetry(embedded ? 1 : 0, 800);
      setIsTeamsHost(runningInTeams);

      if (embedded && !runningInTeams) {
        setLoginError(
          "Microsoft Teams did not finish initializing this app. Refresh the Teams tab once, then try again. If it still fails, verify the Entra SPA redirect URIs include https://ops.panafricanedu.com and brk-multihub://ops.panafricanedu.com.",
        );
        return;
      }

      const loginResult = await instance.loginPopup(loginRequest);
      instance.setActiveAccount(loginResult.account);
      navigate(returnPath, { replace: true });
    } catch (error) {
      const fallbackMessage =
        isTeamsHost || isEmbeddedExperience()
          ? "Microsoft sign-in did not complete inside Teams. Confirm the Teams app manifest uses nested app authentication and that the Entra app registration includes the Teams broker redirect URI."
          : "Microsoft sign-in did not complete. Please try again.";

      const message = error instanceof Error && error.message ? error.message : fallbackMessage;
      setLoginError(message);
    } finally {
      setIsSigningIn(false);
    }
  }

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
          <Button onClick={() => void handleSignIn()} disabled={isSigningIn}>
            {isSigningIn ? "Signing in..." : "Sign in"}
          </Button>
        </div>

        {loginError ? <p className="login-simple__error">{loginError}</p> : null}

        <div className="login-simple__meta">
          {isTeamsHost ? <span>Microsoft Teams ready</span> : null}
          {!isTeamsHost && isEmbeddedExperience() ? <span>Microsoft Teams detected</span> : null}
          <span>Secure organizational access</span>
          <span>Role-based workspace</span>
        </div>
      </section>
    </div>
  );
}
