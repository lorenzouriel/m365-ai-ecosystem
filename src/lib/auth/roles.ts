/**
 * Role-Based Access Control (RBAC)
 * 
 * Defines roles, permissions, and feature access for the platform.
 * Roles are extracted from Entra ID token claims.
 */

import type { UserRole } from './auth-provider';

export type Permission =
  | 'chat:read'
  | 'chat:write'
  | 'documents:read'
  | 'documents:create'
  | 'documents:export'
  | 'email:read'
  | 'email:send'
  | 'knowledge:search'
  | 'knowledge:contribute'
  | 'admin:users'
  | 'admin:config'
  | 'admin:analytics'
  | 'templates:manage';

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    'chat:read', 'chat:write',
    'documents:read', 'documents:create', 'documents:export',
    'email:read', 'email:send',
    'knowledge:search', 'knowledge:contribute',
    'admin:users', 'admin:config', 'admin:analytics',
    'templates:manage',
  ],
  analyst: [
    'chat:read', 'chat:write',
    'documents:read', 'documents:create', 'documents:export',
    'email:read', 'email:send',
    'knowledge:search', 'knowledge:contribute',
  ],
  viewer: [
    'chat:read',
    'documents:read',
    'email:read',
    'knowledge:search',
  ],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function getPermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] || [];
}

/** Navigation items visible to each role */
export interface NavItem {
  label: string;
  href: string;
  icon: string;
  requiredPermission?: Permission;
}

export const NAV_ITEMS: NavItem[] = [
  { label: 'Dashboard', href: '/dashboard', icon: 'LayoutDashboard' },
  { label: 'AI Chat', href: '/chat', icon: 'MessageSquare', requiredPermission: 'chat:read' },
  { label: 'Documents', href: '/documents', icon: 'FileText', requiredPermission: 'documents:read' },
  { label: 'Email', href: '/email', icon: 'Mail', requiredPermission: 'email:read' },
  { label: 'Knowledge Base', href: '/knowledge', icon: 'Brain', requiredPermission: 'knowledge:search' },
  { label: 'Admin', href: '/admin', icon: 'Settings', requiredPermission: 'admin:users' },
];

export function getNavItems(role: UserRole): NavItem[] {
  return NAV_ITEMS.filter(item => {
    if (!item.requiredPermission) return true;
    return hasPermission(role, item.requiredPermission);
  });
}
