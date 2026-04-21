type EnvKey =
  | "VITE_APP_NAME"
  | "VITE_ENTRA_TENANT_ID"
  | "VITE_ENTRA_CLIENT_ID"
  | "VITE_ENTRA_AUTHORITY"
  | "VITE_DATAVERSE_URL"
  | "VITE_DATAVERSE_SCOPE";

function readEnv(key: EnvKey) {
  return import.meta.env[key]?.trim() ?? "";
}

export const env = {
  appName: import.meta.env.VITE_APP_NAME ?? "PAES Reporting",
  entraTenantId: readEnv("VITE_ENTRA_TENANT_ID"),
  entraClientId: readEnv("VITE_ENTRA_CLIENT_ID"),
  entraAuthority: readEnv("VITE_ENTRA_AUTHORITY"),
  dataverseUrl: readEnv("VITE_DATAVERSE_URL").replace(/\/$/, ""),
  dataverseScope: readEnv("VITE_DATAVERSE_SCOPE"),
};

export const requiredEnvKeys: EnvKey[] = [
  "VITE_ENTRA_TENANT_ID",
  "VITE_ENTRA_CLIENT_ID",
  "VITE_ENTRA_AUTHORITY",
  "VITE_DATAVERSE_URL",
  "VITE_DATAVERSE_SCOPE",
];

export const missingEnvKeys = requiredEnvKeys.filter((key) => !readEnv(key));

export const isEnvConfigured = missingEnvKeys.length === 0;
