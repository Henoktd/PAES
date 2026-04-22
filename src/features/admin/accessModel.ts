export type AppRole =
  | "super_admin"
  | "operations_lead"
  | "finance_lead"
  | "partner_manager"
  | "viewer";

export interface RoleDefinition {
  label: string;
  description: string;
  modules: string[];
  canCreateEdit?: boolean;
  canDelete?: boolean;
}

export const rolePrecedence: AppRole[] = [
  "super_admin",
  "operations_lead",
  "finance_lead",
  "partner_manager",
  "viewer",
];

export const roleDefinitions: Record<AppRole, RoleDefinition> = {
  super_admin: {
    label: "Super Admin",
    description: "Full configuration, access management, and reporting visibility.",
    modules: [
      "dashboard",
      "reports",
      "demand",
      "supply",
      "readiness",
      "deployments",
      "payments",
      "partners",
      "learners",
      "courses",
      "events",
      "event-registrations",
      "certifications",
    ],
    canCreateEdit: true,
    canDelete: true,
  },
  operations_lead: {
    label: "Operations Lead",
    description: "Oversees pipeline execution from demand through deployment.",
    modules: [
      "dashboard",
      "reports",
      "demand",
      "supply",
      "readiness",
      "deployments",
      "partners",
      "learners",
      "courses",
      "events",
      "event-registrations",
      "certifications",
    ],
    canCreateEdit: true,
    canDelete: true,
  },
  finance_lead: {
    label: "Finance Lead",
    description: "Reviews payments, revenue, and executive performance.",
    modules: ["dashboard", "reports", "payments", "deployments", "events", "event-registrations", "certifications"],
    canCreateEdit: true,
  },
  partner_manager: {
    label: "Partner Manager",
    description: "Works with partners, supply, learner readiness, and demand allocation.",
    modules: ["dashboard", "reports", "demand", "supply", "readiness", "partners", "learners", "courses"],
    canCreateEdit: true,
  },
  viewer: {
    label: "Viewer",
    description: "Read-only executive visibility across the PAES operating pipeline.",
    modules: ["dashboard", "reports"],
  },
};

export const roleOptions = Object.entries(roleDefinitions).map(([value, definition]) => ({
  value: value as AppRole,
  label: definition.label,
}));
