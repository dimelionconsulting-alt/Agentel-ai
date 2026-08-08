import type { Organization, OrganizationRole, UserProfile } from "./database";

export interface AuthSessionUser {
  id: string;
  email: string;
  emailVerified: boolean;
  fullName: string | null;
  avatarUrl: string | null;
  isPlatformAdmin: boolean;
}

export interface ActiveOrganizationContext {
  organization: Organization;
  role: OrganizationRole;
  membershipId: string;
}

export interface AuthContext {
  user: AuthSessionUser | null;
  profile: UserProfile | null;
  organizations: ActiveOrganizationContext[];
  activeOrganization: ActiveOrganizationContext | null;
}

export interface SignUpInput {
  email: string;
  password: string;
  fullName: string;
  organizationName: string;
}

export interface SignInInput {
  email: string;
  password: string;
}
