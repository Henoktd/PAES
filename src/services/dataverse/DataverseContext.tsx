import type { PropsWithChildren } from "react";
import { createContext, useContext, useMemo } from "react";
import { useMsal } from "@azure/msal-react";
import { DataverseClient } from "./DataverseClient";

const DataverseContext = createContext<DataverseClient | null>(null);

export function DataverseProvider({ children }: PropsWithChildren) {
  const { instance } = useMsal();
  const client = useMemo(() => new DataverseClient(instance), [instance]);

  return <DataverseContext.Provider value={client}>{children}</DataverseContext.Provider>;
}

export function useDataverseClient() {
  const context = useContext(DataverseContext);

  if (!context) {
    throw new Error("useDataverseClient must be used within DataverseProvider.");
  }

  return context;
}
