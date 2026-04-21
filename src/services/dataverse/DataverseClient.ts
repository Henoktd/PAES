import type { IPublicClientApplication } from "@azure/msal-browser";
import { tokenRequest } from "../../config/msal";
import { env } from "../../config/env";
import type { DataverseErrorResponse } from "../../types/entities";

export class DataverseClient {
  constructor(private readonly msalInstance: IPublicClientApplication) {}

  async request<TResponse>(path: string, init?: RequestInit): Promise<TResponse> {
    const accessToken = await this.getAccessToken();

    const response = await fetch(`${env.dataverseUrl}/api/data/v9.2/${path}`, {
      ...init,
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json; charset=utf-8",
        Authorization: `Bearer ${accessToken}`,
        Prefer: 'odata.include-annotations="*"',
        ...init?.headers,
      },
    });

    if (!response.ok) {
      const errorPayload = (await response.json().catch(() => null)) as DataverseErrorResponse | null;
      throw new Error(
        errorPayload?.error?.message ??
          `Dataverse request failed with status ${response.status}`,
      );
    }

    if (response.status === 204) {
      return undefined as TResponse;
    }

    return (await response.json()) as TResponse;
  }

  private async getAccessToken() {
    const activeAccount =
      this.msalInstance.getActiveAccount() ?? this.msalInstance.getAllAccounts()[0];

    if (!activeAccount) {
      throw new Error("No active Microsoft Entra account available.");
    }

    const result = await this.msalInstance.acquireTokenSilent({
      ...tokenRequest,
      account: activeAccount,
    });

    return result.accessToken;
  }
}
