/**
 * Canonical staff workspace URL builders.
 * Employee-facing links never point at /admin/workspaces/[id].
 */

export function getAppOrigin(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "https://www.logicintelligencetechnologies.in"
  ).replace(/\/$/, "");
}

export function getStaffPortalPath(): string {
  return "/staff/dashboard";
}

export function getStaffSetupPath(): string {
  return "/staff/setup-password";
}

export function getStaffLoginPath(next: string = getStaffPortalPath()): string {
  return `/login?next=${encodeURIComponent(next)}`;
}

export function getStaffWorkspaceManagementPath(workspaceId: string): string {
  return `/admin/workspaces/${workspaceId}`;
}

export function getStaffInvitationLoginUrl(origin?: string): string {
  const base = (origin || getAppOrigin()).replace(/\/$/, "");
  return `${base}${getStaffLoginPath(getStaffSetupPath())}`;
}

export function getStaffPortalUrl(origin?: string): string {
  const base = (origin || getAppOrigin()).replace(/\/$/, "");
  return `${base}${getStaffPortalPath()}`;
}

export function getStaffManagementUrl(workspaceId: string, origin?: string): string {
  const base = (origin || getAppOrigin()).replace(/\/$/, "");
  return `${base}${getStaffWorkspaceManagementPath(workspaceId)}`;
}
