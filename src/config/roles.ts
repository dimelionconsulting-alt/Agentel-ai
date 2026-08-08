import type { OrganizationRole } from "@/types";

export const roleLabels: Record<OrganizationRole, string> = {
  owner: "Owner",
  admin: "Admin",
  agent_manager: "Agent manager",
  viewer: "Viewer",
};

export const roleRank: Record<OrganizationRole, number> = {
  viewer: 1,
  agent_manager: 2,
  admin: 3,
  owner: 4,
};

export function hasMinimumRole(
  current: OrganizationRole,
  required: OrganizationRole,
): boolean {
  return roleRank[current] >= roleRank[required];
}

export const writeRoles: OrganizationRole[] = ["owner", "admin", "agent_manager"];
export const billingRoles: OrganizationRole[] = ["owner", "admin"];
export const adminRoles: OrganizationRole[] = ["owner", "admin"];
