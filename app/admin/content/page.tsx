'use client';

import { useEffect, useState } from 'react';
import { Save, Loader2, FileText } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';

type Settings = Record<string, string>;

const CONTENT_FIELDS = [
  { key: 'hero_title', label: 'Hero Title', type: 'text', placeholder: 'Your property. Our marketing power.' },
  { key: 'hero_subtitle', label: 'Hero Subtitle', type: 'textarea', placeholder: 'Company description...' },
  { key: 'about_heading', label: 'About Page Heading', type: 'text', placeholder: 'Marketing real estate with trust...' },
  { key: 'services_intro', label: 'Services Page Intro', type: 'textarea', placeholder: 'Four connected departments...' },
  { key: 'footer_text', label: 'Footer Text', type: 'text', placeholder: 'Real estate marketing...' },
];

const SEO_FIELDS = [
  { key: 'seo_title', label: 'Default SEO Title', type: 'text' },
  { key: 'seo_description', label: 'Default Meta Description', type: 'textarea' },
  { key: 'seo_keywords', label: 'SEO Keywords (comma-separated)', type: 'text' },
];

const CONTACT_FIELDS = [
  { key: 'contact_phone', label: 'Phone Number', type: 'text' },
  { key: 'contact_email', label: 'Email Address', type: 'text' },
  { key: 'contact_address', label: 'Address', type: 'textarea' },
  { key: 'whatsapp_number', label: 'WhatsApp Number (with country code)', type: 'text' },
];

export default function AdminContentPage() {
  return <AdminGuard><ContentContent /></AdminGuard>;
}

function ContentContent() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.from('site_settings').select('key, value').then((res: any) => {
      const map: Settings = {};
      res.data?.forEach((d: any) => { map[d.key] = d.value; });
      setSettings(map);
      setLoading(false);
    });
  }, [supabase]);

  const saveAll = async () => {
    if (!supabase) return;
    setSaving(true);
    const entries = [...CONTENT_FIELDS, ...SEO_FIELDS, ...CONTACT_FIELDS];
    for (const field of entries) {
      const value = settings[field.key] || '';
      const existing = await supabase.from('site_settings').select('id').eq('key', field.key).maybeSingle();
      if (existing.data) {
        await supabase.from('site_settings').update({ value }).eq('id', existing.data.id);
      } else {
        await supabase.from('site_settings').insert({ key: field.key, value });
      }
    }
    if (user) {
      await supabase.from('audit_events').insert({ actor_email: user.email, action: 'Updated website content', entity_type: 'settings' });
    }
    setSaving(false);
    toast.success('Content saved.');
  };

  if (loading) return <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>;

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  const renderField = (field: { key: string; label: string; type: string; placeholder?: string }) => (
    <div key={field.key}>
      <label className={labelClass}>{field.label}</label>
      {field.type === 'textarea' ? (
        <textarea className={inputClass} rows={3} value={settings[field.key] || ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} placeholder={field.placeholder} />
      ) : (
        <input className={inputClass} value={settings[field.key] || ''} onChange={(e) => setSettings({ ...settings, [field.key]: e.target.value })} placeholder={field.placeholder} />
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-serif text-3xl text-foreground mb-1">Website Content</h1><p className="text-sm text-muted-foreground">Edit homepage, SEO and contact information.</p></div>
        <button onClick={saveAll} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 disabled:opacity-50">
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save All
        </button>
      </div>

      <div className="bg-card border border-border/40 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-4"><FileText className="w-4 h-4 text-primary/60" /><h2 className="font-serif text-lg text-foreground">Homepage Content</h2></div>
        <div className="space-y-4">{CONTENT_FIELDS.map(renderField)}</div>
      </div>

      <div className="bg-card border border-border/40 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-4"><h2 className="font-serif text-lg text-foreground">SEO Settings</h2></div>
        <div className="space-y-4">{SEO_FIELDS.map(renderField)}</div>
      </div>

      <div className="bg-card border border-border/40 rounded-sm p-6">
        <div className="flex items-center gap-2 mb-4"><h2 className="font-serif text-lg text-foreground">Contact Information</h2></div>
        <div className="space-y-4">{CONTACT_FIELDS.map(renderField)}</div>
      </div>
    </div>
  );
}
