'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  MessageSquare,
  FileText,
  Mail,
  Brain,
  Settings,
  Building2,
  ChevronLeft,
  ChevronRight,
  LogOut,
  User,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Session for RBAC Demo (In production, this comes from MSAL claims)
const mockSession = {
  user: {
    name: 'Demo User',
    email: 'admin@meridian.com',
    role: 'admin', // Try changing to 'analyst' or 'viewer'
  }
};

const BASE_NAV_ITEMS = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'AI Chat', href: '/chat', icon: MessageSquare },
  { label: 'Documents', href: '/documents', icon: FileText },
  { label: 'Email', href: '/email', icon: Mail },
  { label: 'Knowledge Base', href: '/knowledge', icon: Brain },
];

/**
 * Authenticated Layout
 * 
 * Wraps all authenticated pages with a branded sidebar and top bar.
 * The sidebar shows navigation, user info, and model status.
 */
export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Enforce RBAC
  const isAdmin = mockSession.user.role === 'admin';
  const NAV_ITEMS = isAdmin 
    ? [...BASE_NAV_ITEMS, { label: 'Admin', href: '/admin', icon: Settings }]
    : BASE_NAV_ITEMS;

  useEffect(() => {
    if (pathname === '/admin' && !isAdmin) {
      router.push('/dashboard');
    }
  }, [pathname, isAdmin, router]);

  return (
    <div className="min-h-screen bg-neutral-50 flex">
      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 h-screen bg-brand-primary-dark text-white flex flex-col transition-all duration-300 z-30',
          collapsed ? 'w-[72px]' : 'w-[260px]'
        )}
      >
        {/* Logo */}
        <div className="p-4 flex items-center gap-3 border-b border-white/10 h-16">
          <div className="w-9 h-9 rounded-lg bg-brand-accent/20 flex items-center justify-center shrink-0">
            <Building2 className="w-5 h-5 text-brand-accent" />
          </div>
          {!collapsed && (
            <div className="animate-fade-in">
              <h1 className="text-sm font-bold tracking-tight">Meridian</h1>
              <p className="text-[9px] tracking-[0.15em] uppercase text-neutral-400 -mt-0.5">
                AI Platform
              </p>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(item.href + '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-brand-accent/15 text-brand-accent'
                    : 'text-neutral-400 hover:text-white hover:bg-white/5',
                  collapsed && 'justify-center px-2'
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className={cn('w-5 h-5 shrink-0', isActive && 'text-brand-accent')} />
                {!collapsed && <span>{item.label}</span>}
                {isActive && !collapsed && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-brand-accent" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Model Status */}
        {!collapsed && (
          <div className="px-4 py-3 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-neutral-400">
              <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
              <span>Claude Sonnet 4</span>
              <div className="ml-auto w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            </div>
          </div>
        )}

        {/* User & Collapse */}
        <div className="border-t border-white/10">
          {!collapsed && (
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-brand-accent/20 flex items-center justify-center">
                <User className="w-4 h-4 text-brand-accent" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-white truncate">{mockSession.user.name}</p>
                <p className="text-[10px] text-neutral-400 truncate">{mockSession.user.email}</p>
              </div>
              <button className="p-1.5 rounded-md hover:bg-white/5 transition-colors cursor-pointer" title="Sign out">
                <LogOut className="w-3.5 h-3.5 text-neutral-400" />
              </button>
            </div>
          )}

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="w-full px-4 py-3 flex items-center justify-center gap-2 text-xs text-neutral-500
                       hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            {!collapsed && <span>Collapse</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main
        className={cn(
          'flex-1 transition-all duration-300',
          collapsed ? 'ml-[72px]' : 'ml-[260px]'
        )}
      >
        {children}
      </main>
    </div>
  );
}
