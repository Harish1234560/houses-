'use client';

import { AdminGuard } from '@/components/admin/admin-guard';
import { useAuth } from '@/components/providers/auth-provider';
import { COMPANY } from '@/lib/constants';

export default function AdminSettingsPage() {
  return <AdminGuard><SettingsContent /></AdminGuard>;
}

function SettingsContent() {
  const { user } = useAuth();
  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl text-foreground mb-1">Site Settings</h1><p className="text-sm text-muted-foreground">Account and configuration details.</p></div>
      <div className="bg-card border border-border/40 rounded-sm p-6">
        <h2 className="font-serif text-lg text-foreground mb-4">Account</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border/20"><span className="text-xs text-muted-foreground uppercase">Email</span><span className="text-sm text-foreground">{user?.email}</span></div>
          <div className="flex justify-between py-2 border-b border-border/20"><span className="text-xs text-muted-foreground uppercase">Role</span><span className="text-sm text-foreground">Administrator</span></div>
        </div>
      </div>
      <div className="bg-card border border-border/40 rounded-sm p-6">
        <h2 className="font-serif text-lg text-foreground mb-4">Company Information</h2>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-border/20"><span className="text-xs text-muted-foreground uppercase">Company</span><span className="text-sm text-foreground">{COMPANY.name}</span></div>
          <div className="flex justify-between py-2 border-b border-border/20"><span className="text-xs text-muted-foreground uppercase">Phone</span><span className="text-sm text-foreground">{COMPANY.phone}</span></div>
          <div className="flex justify-between py-2 border-b border-border/20"><span className="text-xs text-muted-foreground uppercase">Email</span><span className="text-sm text-foreground">{COMPANY.email}</span></div>
          <div className="flex justify-between py-2"><span className="text-xs text-muted-foreground uppercase">Location</span><span className="text-sm text-foreground text-right">{COMPANY.address}</span></div>
        </div>
      </div>
      <div className="bg-card border border-border/40 rounded-sm p-6">
        <h2 className="font-serif text-lg text-foreground mb-4">Storage</h2>
        <p className="text-sm text-muted-foreground">Poster images are uploaded to Supabase Storage. Supported formats: JPEG, PNG, WebP. Maximum file size: 10MB.</p>
      </div>
    </div>
  );
}
