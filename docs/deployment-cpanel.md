# Deploying PAES to cPanel

This app is prepared to be hosted at:

- `https://ops.panafricanedu.com`

## Recommended Hosting Shape

- Keep `https://panafricanedu.com` as the public website.
- Point the cPanel subdomain `ops.panafricanedu.com` to its own document root.
- Deploy only the built `dist/` contents to that subdomain root.

## cPanel Setup

1. Create the subdomain `ops.panafricanedu.com` in cPanel.
2. Point it to a dedicated document root.
   Example:
   - `public_html/ops/`
3. Ensure SSL is enabled for the subdomain.
4. Make sure Apache `mod_rewrite` is enabled.
5. The app already includes `public/.htaccess`, which is copied into `dist/` during build for SPA routing.

## Microsoft Entra Setup

Add this production redirect URI to the PAES app registration:

- `https://ops.panafricanedu.com`

If needed for logout and silent renew patterns, also confirm:

- SPA platform is enabled
- Dataverse delegated permission `user_impersonation` is granted

## GitHub Secrets

Set these repository secrets in GitHub before enabling deployment:

### Build-time app secrets

- `VITE_APP_NAME`
- `VITE_ENTRA_TENANT_ID`
- `VITE_ENTRA_CLIENT_ID`
- `VITE_ENTRA_AUTHORITY`
- `VITE_DATAVERSE_URL`
- `VITE_DATAVERSE_SCOPE`

### cPanel deploy secrets

- `CPANEL_FTP_SERVER`
- `CPANEL_FTP_USERNAME`
- `CPANEL_FTP_PASSWORD`
- `CPANEL_FTP_PORT`
- `CPANEL_REMOTE_DIR`

Recommended `CPANEL_REMOTE_DIR` depends on the FTP account root:

- If your FTP user points directly to the subdomain document root, use:
  - `/`
- If your FTP user has access to the parent account root, use the full document-root path.

## Deployment Flow

1. Push to the `main` branch.
2. GitHub Actions will:
   - install dependencies
   - build the Vite app
   - upload `dist/` to the cPanel subdomain directory
3. Visit:
   - `https://ops.panafricanedu.com`

## Notes

- This is a static frontend deployment.
- Secrets are compiled into the app at build time, so use the correct production values in GitHub.
- Do not upload the source repo directly to cPanel.
- For Teams packaging later, use `https://ops.panafricanedu.com` as the app/tab URL.
- If the site shows `404 Not Found` after a successful deploy, the most common cause is `CPANEL_REMOTE_DIR` pointing to the wrong folder. For a dedicated FTP user scoped to `ops.panafricanedu.com/`, set `CPANEL_REMOTE_DIR` to `/`.
