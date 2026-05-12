import { app as teamsApp } from "@microsoft/teams-js";

const TEAMS_UA_PATTERN = /Teams|TeamsMobile|TeamsWebView/i;
const HOST_INIT_TIMEOUT_MS = 5000;

let hostInitializationPromise: Promise<boolean> | null = null;
let hostInitializationComplete = false;

function delay(timeoutMs: number, message: string) {
  return new Promise<never>((_, reject) => {
    window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);
  });
}

function wait(timeoutMs: number) {
  return new Promise<void>((resolve) => {
    window.setTimeout(resolve, timeoutMs);
  });
}

async function initializeTeamsApp() {
  await Promise.race([
    teamsApp.initialize(),
    delay(HOST_INIT_TIMEOUT_MS, "Microsoft Teams initialization timed out."),
  ]);

  hostInitializationComplete = true;

  // Context is helpful for diagnostics, but the nested auth bridge only needs the
  // Teams SDK initialization to complete before MSAL is created.
  void Promise.race([
    teamsApp.getContext(),
    delay(HOST_INIT_TIMEOUT_MS, "Microsoft Teams context retrieval timed out."),
  ]).catch(() => undefined);
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

export async function initializeHostEnvironment(options?: { forceRetry?: boolean }) {
  const forceRetry = options?.forceRetry ?? false;

  if (hostInitializationComplete) {
    return true;
  }

  if (hostInitializationPromise && !forceRetry) {
    return hostInitializationPromise;
  }

  if (!isLikelyTeamsHost()) {
    return false;
  }

  hostInitializationPromise = (async () => {
    try {
      await initializeTeamsApp();
      return true;
    } catch {
      return false;
    }
  })();

  const initialized = await hostInitializationPromise;

  if (!initialized) {
    hostInitializationPromise = null;
  }

  return initialized;
}

export async function initializeHostEnvironmentWithRetry(retryCount = 1, retryDelayMs = 800) {
  let initialized = await initializeHostEnvironment();

  for (let attempt = 0; !initialized && attempt < retryCount && isLikelyTeamsHost(); attempt += 1) {
    await wait(retryDelayMs);
    initialized = await initializeHostEnvironment({ forceRetry: true });
  }

  return initialized;
}
