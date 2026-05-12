# Microsoft Teams setup

The PAES web app can run in Microsoft Teams as a tab app or personal app. The app code is now configured for Microsoft Teams nested app authentication (NAA), which is the Microsoft-recommended approach for SPA apps embedded inside Teams.

## Required Entra app registration settings

In the Microsoft Entra app registration used by PAES:

1. Keep the standard SPA redirect URI:
   - `https://ops.panafricanedu.com`
2. Add the Teams broker redirect URI as a **Single-page application** redirect:
   - `brk-multihub://ops.panafricanedu.com`

The broker redirect must use only the app origin. Do not include any path segments.

## Required Teams manifest settings

Use Teams manifest version `1.22` or later.

Inside `webApplicationInfo`, make sure:

- `id` matches the Entra application (client) ID
- `nestedAppAuthInfo` includes the same broker redirect URI used in the Entra app registration

Example:

```json
{
  "manifestVersion": "1.22",
  "webApplicationInfo": {
    "id": "YOUR-ENTRA-CLIENT-ID",
    "resource": "api://ops.panafricanedu.com/YOUR-ENTRA-CLIENT-ID",
    "nestedAppAuthInfo": [
      {
        "redirectUri": "brk-multihub://ops.panafricanedu.com",
        "scopes": ["openid", "profile", "offline_access"]
      }
    ]
  }
}
```

## Notes

- The app now initializes the Teams host before creating the MSAL client.
- Sign-in uses popup-based interactive auth, which works in the browser and in Teams nested auth.
- Sign-out now uses popup logout first to avoid iframe redirect issues in embedded hosts.
