import type { Configuration, PopupRequest, SilentRequest } from "@azure/msal-browser";
import { env } from "./env";

export const loginRequest: PopupRequest = {
  scopes: ["openid", "profile", "email", ...(env.dataverseScope ? [env.dataverseScope] : [])],
};

export const tokenRequest: Omit<SilentRequest, "account"> = {
  scopes: env.dataverseScope ? [env.dataverseScope] : [],
};

export const msalConfig: Configuration = {
  auth: {
    clientId: env.entraClientId || "00000000-0000-0000-0000-000000000000",
    authority: env.entraAuthority || "https://login.microsoftonline.com/common",
    knownAuthorities: [],
    redirectUri: window.location.origin,
    postLogoutRedirectUri: window.location.origin,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};
