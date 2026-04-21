import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from "react";
import { useMsal } from "@azure/msal-react";
import type { AppRole } from "./accessModel";
import { roleDefinitions, rolePrecedence } from "./accessModel";

interface AccessAssignment {
  email: string;
  role: AppRole;
  displayName?: string;
}

interface AccessControlContextValue {
  currentEmail: string;
  currentRole: AppRole;
  roleSource: "entra" | "local" | "default";
  entraRoles: AppRole[];
  assignments: AccessAssignment[];
  visibleModuleKeys: string[];
  canManageAccess: boolean;
  canAccess: (moduleKey: string) => boolean;
  canCreateEdit: (moduleKey: string) => boolean;
  canDelete: (moduleKey: string) => boolean;
  saveAssignment: (assignment: AccessAssignment) => void;
  removeAssignment: (email: string) => void;
}

const STORAGE_KEY = "paes-access-assignments";

const AccessControlContext = createContext<AccessControlContextValue | null>(null);

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isAppRole(value: string): value is AppRole {
  return value in roleDefinitions;
}

function resolveHighestRole(roles: AppRole[]) {
  return rolePrecedence.find((role) => roles.includes(role)) ?? "viewer";
}

export function AccessControlProvider({ children }: PropsWithChildren) {
  const { accounts } = useMsal();
  const account = accounts[0];
  const currentEmail = normalizeEmail(account?.username ?? "");
  const [assignments, setAssignments] = useState<AccessAssignment[]>([]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const parsed = stored ? (JSON.parse(stored) as AccessAssignment[]) : [];

    const normalized = parsed.map((entry) => ({
      ...entry,
      email: normalizeEmail(entry.email),
    }));

    if (currentEmail && !normalized.some((entry) => entry.email === currentEmail)) {
      normalized.unshift({
        email: currentEmail,
        role: "super_admin",
        displayName: account?.name ?? "Current user",
      });
    }

    setAssignments(normalized);
  }, [account?.name, currentEmail]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(assignments));
  }, [assignments]);

  const rawRoleClaims = (account?.idTokenClaims as { roles?: unknown } | undefined)?.roles;
  const entraRoles = (Array.isArray(rawRoleClaims) ? rawRoleClaims : [])
    .filter((value): value is string => typeof value === "string")
    .map((value: string) => value.trim())
    .filter(isAppRole);
  const localRole = assignments.find((assignment) => assignment.email === currentEmail)?.role;
  const currentRole = entraRoles.length > 0 ? resolveHighestRole(entraRoles) : localRole ?? "viewer";
  const roleSource: "entra" | "local" | "default" =
    entraRoles.length > 0 ? "entra" : localRole ? "local" : "default";
  const visibleModuleKeys = roleDefinitions[currentRole].modules;

  const value = useMemo<AccessControlContextValue>(
    () => ({
      currentEmail,
      currentRole,
      roleSource,
      entraRoles,
      assignments,
      visibleModuleKeys,
      canManageAccess: Boolean(roleDefinitions[currentRole].canManageAccess),
      canAccess: (moduleKey: string) => visibleModuleKeys.includes(moduleKey),
      canCreateEdit: (moduleKey: string) =>
        visibleModuleKeys.includes(moduleKey) && Boolean(roleDefinitions[currentRole].canCreateEdit),
      canDelete: (moduleKey: string) =>
        visibleModuleKeys.includes(moduleKey) && Boolean(roleDefinitions[currentRole].canDelete),
      saveAssignment: (assignment) => {
        setAssignments((currentAssignments) => {
          const next = currentAssignments.filter(
            (entry) => entry.email !== normalizeEmail(assignment.email),
          );
          next.push({
            ...assignment,
            email: normalizeEmail(assignment.email),
          });
          return next.sort((left, right) => left.email.localeCompare(right.email));
        });
      },
      removeAssignment: (email) => {
        const normalizedEmail = normalizeEmail(email);
        setAssignments((currentAssignments) =>
          currentAssignments.filter((entry) => entry.email !== normalizedEmail),
        );
      },
    }),
    [assignments, currentEmail, currentRole, entraRoles, roleSource, visibleModuleKeys],
  );

  return <AccessControlContext.Provider value={value}>{children}</AccessControlContext.Provider>;
}

export function useAccessControl() {
  const context = useContext(AccessControlContext);
  if (!context) {
    throw new Error("useAccessControl must be used within AccessControlProvider.");
  }

  return context;
}
