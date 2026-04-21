/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_APP_NAME?: string;
  readonly VITE_ENTRA_TENANT_ID?: string;
  readonly VITE_ENTRA_CLIENT_ID?: string;
  readonly VITE_ENTRA_AUTHORITY?: string;
  readonly VITE_DATAVERSE_URL?: string;
  readonly VITE_DATAVERSE_SCOPE?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
