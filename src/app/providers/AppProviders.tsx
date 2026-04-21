import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import { PublicClientApplication } from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { msalConfig } from "../../config/msal";
import { queryClient } from "../../lib/queryClient";
import { LoadingState } from "../../components/ui/LoadingState";

const msalInstance = new PublicClientApplication(msalConfig);

export function AppProviders({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      await msalInstance.initialize();

      const redirectResult = await msalInstance.handleRedirectPromise();
      const redirectAccount = redirectResult?.account;
      const existingAccount = msalInstance.getActiveAccount() ?? msalInstance.getAllAccounts()[0];

      if (redirectAccount) {
        msalInstance.setActiveAccount(redirectAccount);
      } else if (existingAccount) {
        msalInstance.setActiveAccount(existingAccount);
      }

      if (!cancelled) {
        setIsReady(true);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady) {
    return <LoadingState label="Preparing Microsoft sign-in..." />;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MsalProvider>
  );
}
