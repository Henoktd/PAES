import { app as teamsApp } from "@microsoft/teams-js";

const TEAMS_UA_PATTERN = /Teams|TeamsMobile|TeamsWebView/i;

let hostInitializationPromise: Promise<boolean> | null = null;

function delay(timeoutMs: number) {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error("Host initialization timed out."));
    }, timeoutMs);
  });
}

export function isEmbeddedExperience() {
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

function isLikelyTeamsHost() {
  return isEmbeddedExperience() || TEAMS_UA_PATTERN.test(window.navigator.userAgent);
}

export async function initializeHostEnvironment() {
  if (hostInitializationPromise) {
    return hostInitializationPromise;
  }

  hostInitializationPromise = (async () => {
    if (!isLikelyTeamsHost()) {
      return false;
    }

    try {
      await Promise.race([teamsApp.initialize(), delay(1500)]);
      await Promise.race([teamsApp.getContext(), delay(1500)]);
      return true;
    } catch {
      return false;
    }
  })();

  return hostInitializationPromise;
}
