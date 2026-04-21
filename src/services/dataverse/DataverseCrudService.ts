import type { BaseRecord, DataverseListResponse, EntityId, ModuleConfig } from "../../types/entities";
import { buildCreatePayload, buildUpdatePayload, mapDataverseRecord } from "./dataverseMapping";
import type { DataverseClient } from "./DataverseClient";

export class DataverseCrudService<TRecord extends BaseRecord> {
  constructor(
    private readonly client: DataverseClient,
    private readonly moduleConfig: ModuleConfig<TRecord>,
  ) {}

  async list() {
    const select = Array.from(
      new Set([
        this.moduleConfig.primaryIdField,
        ...this.moduleConfig.columns.map((column) => String(column.key)),
        ...this.moduleConfig.detailFields.map((field) => String(field.key)),
        ...(this.moduleConfig.formFields ?? []).map((field) => field.key),
      ]),
    ).join(",");

    const response = await this.client.request<DataverseListResponse<Record<string, unknown>>>(
      `${this.moduleConfig.entitySetName}?$select=${select}`,
    );

    return response.value.map((item) =>
      mapDataverseRecord<TRecord>(item, this.moduleConfig.primaryIdField),
    );
  }

  async getById(id: EntityId) {
    const select = Array.from(
      new Set([
        this.moduleConfig.primaryIdField,
        ...this.moduleConfig.columns.map((column) => String(column.key)),
        ...this.moduleConfig.detailFields.map((field) => String(field.key)),
        ...(this.moduleConfig.formFields ?? []).map((field) => field.key),
      ]),
    ).join(",");

    const response = await this.client.request<Record<string, unknown>>(
      `${this.moduleConfig.entitySetName}(${id})?$select=${select}`,
    );

    return mapDataverseRecord<TRecord>(response, this.moduleConfig.primaryIdField);
  }

  async create(values: Partial<TRecord>) {
    const payload = buildCreatePayload(values);
    const response = await this.client.request<TRecord>(this.moduleConfig.entitySetName, {
      method: "POST",
      body: JSON.stringify(payload),
    });

    return response;
  }

  async update(id: EntityId, values: Partial<TRecord>) {
    const payload = buildUpdatePayload(values);
    await this.client.request<void>(`${this.moduleConfig.entitySetName}(${id})`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    });
  }

  async delete(id: EntityId) {
    await this.client.request<void>(`${this.moduleConfig.entitySetName}(${id})`, {
      method: "DELETE",
    });
  }
}
