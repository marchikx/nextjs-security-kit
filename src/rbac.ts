export type Role = "admin" | "editor" | "viewer";

export type Permission =
  | "users:read"
  | "users:write"
  | "content:read"
  | "content:write"
  | "content:publish"
  | "settings:write";

const ROLE_PERMISSIONS: Record<Role, ReadonlySet<Permission>> = {
  admin: new Set([
    "users:read",
    "users:write",
    "content:read",
    "content:write",
    "content:publish",
    "settings:write",
  ]),
  editor: new Set([
    "content:read",
    "content:write",
    "content:publish",
  ]),
  viewer: new Set(["content:read"]),
};

export function permissionsFor(role: Role): readonly Permission[] {
  return [...ROLE_PERMISSIONS[role]];
}

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}

export function assertCan(role: Role, permission: Permission): void {
  if (!can(role, permission)) {
    throw new Error(`role ${role} lacks permission ${permission}`);
  }
}
