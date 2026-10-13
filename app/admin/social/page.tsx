'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, Share2, ExternalLink } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type SocialProfile = {
  id: string;
  platform: string;
  url: string | null;
  is_visible: boolean;
  display_order: number;
};

const PLATFORMS = ['Instagram', 'WhatsApp'];

export default function AdminSocialPage() {
  return <AdminGuard><SocialContent /></AdminGuard>;
}

function SocialContent() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<Record<string, SocialProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('social_profiles').select('*').then((res: any) => {
      const map: Record<string, SocialProfile> = {};
      PLATFORMS.forEach((p) => {
        const existing = res.data?.find((d: any) => d.platform === p);
        map[p] = existing || { id: '', platform: p, url: '', is_visible: false, display_order: PLATFORMS.indexOf(p) };
      });
      setProfiles(map);
      setLoading(false);
    });
  }, [supabase]);

  const saveProfile = async (platform: string) => {
    if (!supabase) return;
    const profile = profiles[platform];
    setSaving(platform);
    if (profile.id) {
      const { error } = await supabase.from('social_profiles').update({ url: profile.url, is_visible: profile.is_visible, display_order: profile.display_order }).eq('id', profile.id);
      if (error) { toast.error('Failed to save.'); setSaving(null); return; }
    } else {
      const { error } = await supabase.from('social_profiles').insert({ platform, url: profile.url, is_visible: profile.is_visible, display_order: profile.display_order });
      if (error) { toast.error('Failed to save.'); setSaving(null); return; }
    }
    if (user) {
      await supabase.from('audit_events').insert({ actor_email: user.email, action: 'Updated social profile', entity_type: 'social', details: platform });
    }
    setSaving(null);
    toast.success(`${platform} profile saved.`);
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';

  return (
    <div className="space-y-6">
      <div><h1 className="font-serif text-3xl text-foreground mb-1">Social Profiles</h1><p className="text-sm text-muted-foreground">Configure social media links. Unconfigured profiles are hidden from the website.</p></div>
      <div className="space-y-4">
        {PLATFORMS.map((platform) => {
          const p = profiles[platform];
          return (
            <div key={platform} className="bg-card border border-border/40 rounded-sm p-5">
              <div className="flex items-center gap-3 mb-4">
                <Share2 className="w-4 h-4 text-primary/60" />
                <h3 className="font-serif text-lg text-foreground">{platform}</h3>
                {p.url && p.is_visible && <span className="text-xs px-2 py-0.5 bg-green-500/15 text-green-400 rounded-sm">Visible</span>}
              </div>
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                <input className={inputClass + ' flex-1'} value={p.url || ''} onChange={(e) => setProfiles({ ...profiles, [platform]: { ...p, url: e.target.value } })} placeholder={`https://${platform.toLowerCase()}.com/...`} />
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={p.is_visible} onChange={(e) => setProfiles({ ...profiles, [platform]: { ...p, is_visible: e.target.checked } })} className="w-4 h-4 accent-primary" />
                  <span className="text-sm text-foreground">Show</span>
                </label>
                <button onClick={() => saveProfile(platform)} disabled={saving === platform} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                  {saving === platform ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />} Save
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
