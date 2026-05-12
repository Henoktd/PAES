import type { PropsWithChildren } from "react";
import { useEffect, useState } from "react";
import type { IPublicClientApplication } from "@azure/msal-browser";
import {
  createNestablePublicClientApplication,
  createStandardPublicClientApplication,
} from "@azure/msal-browser";
import { MsalProvider } from "@azure/msal-react";
import { QueryClientProvider } from "@tanstack/react-query";
import { msalConfig } from "../../config/msal";
import {
  initializeHostEnvironmentWithRetry,
  isEmbeddedExperience,
} from "../../features/auth/hostEnvironment";
import { queryClient } from "../../lib/queryClient";
import { LoadingState } from "../../components/ui/LoadingState";

export function AppProviders({ children }: PropsWithChildren) {
  const [isReady, setIsReady] = useState(false);
  const [msalInstance, setMsalInstance] = useState<IPublicClientApplication | null>(null);

  useEffect(() => {
    let cancelled = false;

    const bootstrap = async () => {
      const embedded = isEmbeddedExperience();

      if (embedded) {
        await initializeHostEnvironmentWithRetry(2, 1000);
      } else {
        await initializeHostEnvironmentWithRetry();
      }

      const instance = await createNestablePublicClientApplication(msalConfig).catch(() =>
        createStandardPublicClientApplication(msalConfig),
      );

      const redirectResult = await instance.handleRedirectPromise();
      const redirectAccount = redirectResult?.account;
      const existingAccount = instance.getActiveAccount() ?? instance.getAllAccounts()[0];

      if (redirectAccount) {
        instance.setActiveAccount(redirectAccount);
      } else if (existingAccount) {
        instance.setActiveAccount(existingAccount);
      }

      if (!cancelled) {
        setMsalInstance(instance);
        setIsReady(true);
      }
    };

    void bootstrap();

    return () => {
      cancelled = true;
    };
  }, []);

  if (!isReady || !msalInstance) {
    return <LoadingState label="Preparing Microsoft sign-in..." />;
  }

  return (
    <MsalProvider instance={msalInstance}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </MsalProvider>
  );
}
