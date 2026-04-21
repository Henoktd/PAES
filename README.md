# PAES Reporting

Production-oriented React + TypeScript + Vite starter for PAES (Pan Africa Education & Skills), built around:

- Microsoft Entra ID authentication with MSAL SPA flows
- Microsoft Dataverse as the system of record via the Dataverse Web API
- React Router for route composition
- TanStack Query for scalable server-state management
- React Hook Form + Zod for validated reusable forms

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy `.env.example` to `.env` and fill in your Entra ID and Dataverse values.
   Use the Dataverse delegated scope format such as `https://your-environment.crm.dynamics.com/user_impersonation`.

3. Run locally:

```bash
npm run dev
```

## Production Deployment

Recommended production URL:

- `https://ops.panafricanedu.com`

This repo includes:

- `public/.htaccess` for cPanel SPA routing
- `.github/workflows/deploy-cpanel.yml` for GitHub Actions deployment
- `.env.production.example` for production build values
- `docs/deployment-cpanel.md` for the full cPanel + GitHub setup guide

Recommended production approach:

1. Host the public website at `https://panafricanedu.com`
2. Host the PAES app at `https://ops.panafricanedu.com`
3. Push this repo to GitHub
4. Add the required GitHub Actions secrets
5. Deploy `dist/` automatically to the cPanel subdomain directory

## Folder Structure

```text
src/
  app/
    App.tsx
    providers/AppProviders.tsx
    routes.tsx
  components/
    data/
    forms/
    layout/
    ui/
  config/
    env.ts
    msal.ts
  features/
    auth/
    dashboard/
    demand/
    generic/
    modules/
    supply/
  hooks/
    useCrudResource.ts
  lib/
    queryClient.ts
    utils.ts
  services/
    dataverse/
  styles/
    globals.css
  types/
    entities.ts
```

## Integration Notes

- Dataverse is accessed through `DataverseClient`, which acquires Entra ID access tokens from MSAL.
- Module metadata is centralized so future Power BI, SharePoint, LearnWorlds, and payment integrations can be added without restructuring the app shell.
- Additional Dataverse tables can be added by extending `src/features/modules/moduleRegistry.tsx`.
