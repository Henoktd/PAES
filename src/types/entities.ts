export type EntityId = string;

export interface BaseRecord {
  id: EntityId;
  name: string;
  status: string;
  owner?: string;
  createdOn?: string;
  modifiedOn?: string;
}

export interface DemandRecord extends BaseRecord {
  sector: string;
  region: string;
  requestedSeats: number;
  demandDate?: string;
}

export interface SupplyRecord extends BaseRecord {
  specialization: string;
  capacity: number;
  location: string;
  partner?: string;
}

export interface ModuleSummaryStat {
  label: string;
  value: string;
  tone?: "default" | "positive" | "warning";
}

export interface DataverseListResponse<T> {
  value: T[];
  "@odata.nextLink"?: string;
}

export interface DataverseErrorResponse {
  error?: {
    message?: string;
  };
}

export interface ModuleFormField {
  key: string;
  label: string;
  type?: "text" | "number" | "date" | "email" | "tel" | "textarea" | "lookup";
  required?: boolean;
  placeholder?: string;
  description?: string;
  hidden?: boolean;
  autoGenerate?: {
    prefix: string;
  };
  min?: number;
  max?: number;
  step?: number;
  minLength?: number;
  maxLength?: number;
  pattern?: string;
  patternMessage?: string;
  options?: Array<{
    label: string;
    value: string;
  }>;
  lookup?: {
    moduleKey: string;
    bindKey: string;
  };
}

export interface ModuleConfig<TRecord extends BaseRecord> {
  key: string;
  label: string;
  singularLabel: string;
  path: string;
  icon: "layout" | "briefcase" | "users" | "building" | "map" | "graduation" | "book" | "wallet" | "calendar";
  tableName: string;
  entitySetName: string;
  primaryIdField: string;
  titleField: keyof TRecord;
  columns: Array<{
    key: keyof TRecord;
    label: string;
  }>;
  detailFields: Array<{
    key: keyof TRecord;
    label: string;
  }>;
  formFields?: ModuleFormField[];
}
