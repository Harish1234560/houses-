'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Megaphone } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Campaign = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  description: string | null;
  status: string;
  publish_at: string | null;
  expire_at: string | null;
  created_at: string;
};

const CATEGORIES = ['New Launch', 'Residential Plots', 'Premium', 'Farmland', 'Investment', 'Announcement', 'Festival'];
const STATUSES = ['draft', 'published', 'archived'];

export default function AdminCampaignsPage() {
  return <AdminGuard><CampaignsContent /></AdminGuard>;
}

function CampaignsContent() {
  const { supabase } = useSupabase();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Campaign | null>(null);

  const fetchCampaigns = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('campaigns').select('*').order('created_at', { ascending: false });
    if (data) setCampaigns(data as Campaign[]);
    setLoading(false);
  };

  useEffect(() => { fetchCampaigns(); }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Delete this campaign?')) return;
    const { error } = await supabase.from('campaigns').delete().eq('id', id);
    if (error) { toast.error('Failed to delete.'); return; }
    toast.success('Campaign deleted.');
    fetchCampaigns();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Campaigns</h1>
          <p className="text-sm text-muted-foreground">Group posters into campaign collections.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> New Campaign
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : campaigns.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm">
          <Megaphone className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No campaigns yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {campaigns.map((c) => (
            <div key={c.id} className="bg-card border border-border/40 rounded-sm p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm text-foreground font-medium">{c.title}</h3>
                  {c.category && <p className="text-xs text-primary mt-0.5">{c.category}</p>}
                </div>
                <span className={cn('text-[0.65rem] px-2 py-0.5 rounded-sm uppercase', c.status === 'published' ? 'bg-green-500/80 text-white' : c.status === 'archived' ? 'bg-muted text-muted-foreground' : 'bg-yellow-500/80 text-black')}>{c.status}</span>
              </div>
              {c.description && <p className="text-xs text-muted-foreground line-clamp-2 mb-3">{c.description}</p>}
              <div className="flex items-center gap-2 mt-3">
                <button onClick={() => { setEditing(c); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <CampaignForm campaign={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { fetchCampaigns(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function CampaignForm({ campaign, onClose, onSaved }: { campaign: Campaign | null; onClose: () => void; onSaved: () => void }) {
  const { supabase } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: campaign?.title || '',
    slug: campaign?.slug || '',
    category: campaign?.category || 'New Launch',
    description: campaign?.description || '',
    status: campaign?.status || 'draft',
    publish_at: campaign?.publish_at ? campaign.publish_at.slice(0, 16) : '',
    expire_at: campaign?.expire_at ? campaign.expire_at.slice(0, 16) : '',
  });

  const handleSave = async () => {
    if (!supabase || !form.title.trim()) { toast.error('Title is required.'); return; }
    const slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    setSaving(true);
    const payload = {
      title: form.title, slug, category: form.category, description: form.description || null, status: form.status,
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
      expire_at: form.expire_at ? new Date(form.expire_at).toISOString() : null,
    };
    const result = campaign ? await supabase.from('campaigns').update(payload).eq('id', campaign.id) : await supabase.from('campaigns').insert(payload);
    if (result.error) { setSaving(false); toast.error('Failed to save.'); return; }
    setSaving(false); toast.success(campaign ? 'Campaign updated.' : 'Campaign created.'); onSaved();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border/40 rounded-sm w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="font-serif text-xl text-foreground">{campaign ? 'Edit Campaign' : 'New Campaign'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div><label className={labelClass}>Title *</label><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className={labelClass}>Slug</label><input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
            <div><label className={labelClass}>Status</label><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Publish Date</label><input type="datetime-local" className={inputClass} value={form.publish_at} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} /></div>
            <div><label className={labelClass}>Expiry Date</label><input type="datetime-local" className={inputClass} value={form.expire_at} onChange={(e) => setForm({ ...form, expire_at: e.target.value })} /></div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/30">
          <button onClick={onClose} className="px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
        </div>
      </div>
    </div>
  );
}
