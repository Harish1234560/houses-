'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Package, Eye, EyeOff } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';

type Pkg = {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  price: string | null;
  notes: string | null;
  is_published: boolean;
  display_order: number;
};

export default function AdminPackagesPage() {
  return <AdminGuard><PackagesContent /></AdminGuard>;
}

function PackagesContent() {
  const { supabase } = useSupabase();
  const [packages, setPackages] = useState<Pkg[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Pkg | null>(null);

  const fetchPackages = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('marketing_packages').select('*').order('display_order');
    if (data) setPackages(data as Pkg[]);
    setLoading(false);
  };

  useEffect(() => { fetchPackages(); }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Delete this package?')) return;
    const { error } = await supabase.from('marketing_packages').delete().eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    toast.success('Package deleted.'); fetchPackages();
  };

  const togglePublish = async (p: Pkg) => {
    if (!supabase) return;
    const { error } = await supabase.from('marketing_packages').update({ is_published: !p.is_published }).eq('id', p.id);
    if (error) { toast.error('Failed.'); return; }
    fetchPackages();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-serif text-3xl text-foreground mb-1">Marketing Packages</h1><p className="text-sm text-muted-foreground">Configure pricing tiers shown on the website.</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Package</button>
      </div>
      {loading ? (<div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>) : packages.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm"><Package className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No packages configured.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {packages.map((p) => (
            <div key={p.id} className="bg-card border border-border/40 rounded-sm p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div><h3 className="font-serif text-lg text-foreground">{p.name}</h3>{p.price && <p className="text-sm text-primary mt-1">{p.price}</p>}</div>
                <div className="flex items-center gap-1">
                  <button onClick={() => togglePublish(p)} className="p-1.5 text-muted-foreground hover:text-primary">{p.is_published ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  <button onClick={() => { setEditing(p); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(p.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{p.description}</p>
              {p.features.length > 0 && <div className="flex flex-wrap gap-1 mt-3">{p.features.slice(0, 3).map((f) => <span key={f} className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded-sm">{f}</span>)}</div>}
            </div>
          ))}
        </div>
      )}
      {showForm && <PackageForm pkg={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { fetchPackages(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function PackageForm({ pkg, onClose, onSaved }: { pkg: Pkg | null; onClose: () => void; onSaved: () => void }) {
  const { supabase } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: pkg?.name || '',
    description: pkg?.description || '',
    features: (pkg?.features || []).join('\n'),
    price: pkg?.price || '',
    notes: pkg?.notes || '',
    is_published: pkg?.is_published || false,
    display_order: pkg?.display_order || 0,
  });

  const handleSave = async () => {
    if (!supabase || !form.name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    const payload = { name: form.name, description: form.description || null, features: form.features.split('\n').map((f) => f.trim()).filter(Boolean), price: form.price || null, notes: form.notes || null, is_published: form.is_published, display_order: form.display_order };
    const result = pkg ? await supabase.from('marketing_packages').update(payload).eq('id', pkg.id) : await supabase.from('marketing_packages').insert(payload);
    if (result.error) { setSaving(false); toast.error('Failed to save.'); return; }
    setSaving(false); toast.success(pkg ? 'Package updated.' : 'Package created.'); onSaved();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border/40 rounded-sm w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="font-serif text-xl text-foreground">{pkg ? 'Edit Package' : 'New Package'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div><label className={labelClass}>Name *</label><input className={inputClass} value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Starter Listing" /></div>
          <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className={labelClass}>Price</label><input className={inputClass} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Contact for pricing" /></div>
          <div><label className={labelClass}>Features (one per line)</label><textarea className={inputClass} rows={5} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Project listing&#10;Lead forwarding&#10;Basic analytics" /></div>
          <div><label className={labelClass}>Notes</label><input className={inputClass} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Additional terms or notes" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Display Order</label><input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-end pb-2.5"><label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_published} onChange={(e) => setForm({ ...form, is_published: e.target.checked })} className="w-4 h-4 accent-primary" /><span className="text-sm text-foreground">Published</span></label></div>
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
