import type { BaseRecord } from "../../types/entities";

export function mapDataverseRecord<TRecord extends BaseRecord>(
  raw: Record<string, unknown>,
  primaryIdField?: string,
): TRecord {
  const detectedIdField = primaryIdField ?? Object.keys(raw).find((key) => key.endsWith("id")) ?? "id";

  return {
    id: String(raw[detectedIdField] ?? raw.id ?? ""),
    name: String(raw.name ?? raw.title ?? raw.subject ?? "Untitled"),
    status: String(raw.status ?? raw.statecode ?? "Unknown"),
    owner: raw.owner ? String(raw.owner) : undefined,
    createdOn: raw.createdOn ? String(raw.createdOn) : undefined,
    modifiedOn: raw.modifiedOn ? String(raw.modifiedOn) : undefined,
    ...raw,
  } as TRecord;
}

export function buildCreatePayload<TRecord extends BaseRecord>(values: Partial<TRecord>) {
  const payload = { ...values } as Record<string, unknown>;
  delete payload.id;
  return payload;
}

export function buildUpdatePayload<TRecord extends BaseRecord>(values: Partial<TRecord>) {
  const payload = { ...values } as Record<string, unknown>;
  delete payload.id;
  return payload;
}
