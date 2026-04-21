import { AppProviders } from "./providers/AppProviders";
import { AppRouter } from "./routes";
import { SetupRequiredPage } from "../features/auth/SetupRequiredPage";
import { isEnvConfigured, missingEnvKeys } from "../config/env";

export function App() {
  if (!isEnvConfigured) {
    return <SetupRequiredPage missingKeys={missingEnvKeys} />;
  }

  return (
    <AppProviders>
      <AppRouter />
    </AppProviders>
  );
}
