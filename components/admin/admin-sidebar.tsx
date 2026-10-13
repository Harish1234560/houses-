'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Image,
  Megaphone,
  Briefcase,
  Package,
  Mail,
  Share2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/providers/auth-provider';
import { COMPANY } from '@/lib/constants';

const NAV_ITEMS = [
  { href: '/admin', label: 'Overview', icon: LayoutDashboard },
  { href: '/admin/projects', label: 'Projects', icon: FolderKanban },
  { href: '/admin/posters', label: 'Poster Manager', icon: Image },
  { href: '/admin/campaigns', label: 'Campaigns', icon: Megaphone },
  { href: '/admin/services', label: 'Services', icon: Briefcase },
  { href: '/admin/packages', label: 'Marketing Packages', icon: Package },
  { href: '/admin/enquiries', label: 'Enquiries', icon: Mail },
  { href: '/admin/social', label: 'Social Profiles', icon: Share2 },
  { href: '/admin/content', label: 'Website Content', icon: FileText },
  { href: '/admin/settings', label: 'Site Settings', icon: Settings },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { user, signOut, loading } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleSignOut = async () => {
    await signOut();
  };

  const sidebar = (
    <div className="flex flex-col h-full bg-card border-r border-border/30 w-64 shrink-0">
      <div className="p-6 border-b border-border/30">
        <Link href="/admin" className="flex items-center gap-3" onClick={() => setMobileOpen(false)}>
          <div className="w-9 h-9 rounded-sm border border-primary/40 flex items-center justify-center bg-primary/5">
            <span className="font-serif text-primary text-lg font-semibold">GA</span>
          </div>
          <div>
            <div className="font-serif text-foreground text-sm leading-tight">Golden Axis</div>
            <div className="text-[0.6rem] tracking-editorial uppercase text-muted-foreground leading-tight">Admin Panel</div>
          </div>
        </Link>
      </div>

      <nav className="flex-1 overflow-y-auto p-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={cn(
                'flex items-center gap-3 px-4 py-2.5 text-sm rounded-sm transition-colors',
                isActive(item.href)
                  ? 'bg-primary/10 text-primary border-l-2 border-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50 border-l-2 border-transparent'
              )}
            >
              <Icon className="w-4 h-4 shrink-0" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-border/30 space-y-2">
        <Link
          href="/"
          className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          <Home className="w-3.5 h-3.5" />
          View public site
        </Link>
        {user && (
          <div className="px-4 py-2">
            <div className="text-xs text-muted-foreground truncate">{user.email}</div>
          </div>
        )}
        {user && (
          <button
            onClick={handleSignOut}
            className="flex items-center gap-3 px-4 py-2 text-xs text-muted-foreground hover:text-destructive transition-colors w-full"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign out
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <div className="hidden lg:block sticky top-0 h-screen">{sidebar}</div>

      <div className="lg:hidden">
        <div className="flex items-center justify-between p-4 bg-card border-b border-border/30 sticky top-0 z-40">
          <Link href="/admin" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-sm border border-primary/40 flex items-center justify-center bg-primary/5">
              <span className="font-serif text-primary text-sm font-semibold">GA</span>
            </div>
            <span className="font-serif text-foreground text-sm">Admin</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 text-foreground"
            aria-label="Open admin menu"
          >
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-background/80" onClick={() => setMobileOpen(false)} />
            <div className="relative z-10 h-full">
              <div className="absolute top-4 right-4 z-20">
                <button
                  onClick={() => setMobileOpen(false)}
                  className="p-2 text-muted-foreground hover:text-foreground"
                  aria-label="Close menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              {sidebar}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
