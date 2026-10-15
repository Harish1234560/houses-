'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Save, Loader2, FileText, Upload, X } from 'lucide-react';
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
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const [settings, setSettings] = useState<Settings>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

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
    if (!supabase) {
      toast.error('Content storage is unavailable. Please try again later.');
      return;
    }
    setSaving(true);
    const entries = [...CONTENT_FIELDS, ...SEO_FIELDS, ...CONTACT_FIELDS, { key: 'logo_url' }];
    const { error } = await supabase.from('site_settings').upsert(
      entries.map(({ key }) => ({ key, value: settings[key] || '' })),
      { onConflict: 'key' }
    );
    if (error) {
      setSaving(false);
      toast.error(`Failed to save content: ${error.message}`);
      return;
    }
    if (user) {
      await supabase.from('audit_events').insert({ actor_email: user.email, action: 'Updated website content', entity_type: 'settings' });
    }
    setSaving(false);
    toast.success('Content saved.');
  };

  const handleLogoUpload = async (file: File) => {
    if (!supabase) {
      toast.error('Image storage is unavailable. Please try again later.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error('File too large. Maximum 10MB.');
      return;
    }
    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      toast.error('Only JPEG, PNG and WebP files are supported.');
      return;
    }

    setUploadingLogo(true);
    try {
      const ext = file.type.split('/')[1];
      const filename = `logos/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('site-assets')
        .upload(filename, file, { cacheControl: '3600', contentType: file.type });

      if (error) throw error;

      const { data } = supabase.storage.from('site-assets').getPublicUrl(filename);
      setSettings((current) => ({ ...current, logo_url: data.publicUrl }));
      toast.success('Logo uploaded. Click Save All to apply it.');
    } catch (error) {
      toast.error(error instanceof Error ? `Logo upload failed: ${error.message}` : 'Logo upload failed.');
    } finally {
      setUploadingLogo(false);
    }
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
        <div className="flex items-center gap-2 mb-4"><h2 className="font-serif text-lg text-foreground">Brand Logo</h2></div>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          {settings.logo_url ? (
            <div className="relative flex items-center justify-center w-56 h-28 bg-background border border-border/40 rounded-sm p-3">
              <Image src={settings.logo_url} alt="Current site logo" fill unoptimized sizes="208px" className="object-contain p-3" />
              <button
                type="button"
                onClick={() => setSettings((current) => ({ ...current, logo_url: '' }))}
                className="absolute top-1 right-1 p-1.5 bg-card rounded-sm text-muted-foreground hover:text-destructive"
                aria-label="Remove logo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-center w-56 h-28 border-2 border-dashed border-border rounded-sm text-sm text-muted-foreground">
              No logo uploaded
            </div>
          )}
          <div>
            <button
              type="button"
              onClick={() => logoFileInputRef.current?.click()}
              disabled={uploadingLogo}
              className="inline-flex items-center gap-2 px-4 py-2.5 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/50 disabled:opacity-50"
            >
              {uploadingLogo ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
            </button>
            <input
              ref={logoFileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(event) => {
                const file = event.currentTarget.files?.[0];
                if (file) void handleLogoUpload(file);
                event.currentTarget.value = '';
              }}
            />
            <p className="text-xs text-muted-foreground mt-2">JPEG, PNG or WebP · maximum 10MB. Save All to publish changes.</p>
          </div>
        </div>
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
