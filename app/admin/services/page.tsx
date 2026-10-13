'use client';

import { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Save, Loader2, Briefcase, Eye, EyeOff } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';

type Service = {
  id: string;
  number: string | null;
  title: string;
  description: string | null;
  features: string[];
  icon_name: string | null;
  display_order: number;
  is_visible: boolean;
};

export default function AdminServicesPage() {
  return <AdminGuard><ServicesContent /></AdminGuard>;
}

function ServicesContent() {
  const { supabase } = useSupabase();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Service | null>(null);

  const fetchServices = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('services').select('*').order('display_order');
    if (data) setServices(data as Service[]);
    setLoading(false);
  };

  useEffect(() => { fetchServices(); }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!supabase || !confirm('Delete this service?')) return;
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) { toast.error('Failed.'); return; }
    toast.success('Service deleted.'); fetchServices();
  };

  const toggleVisible = async (s: Service) => {
    if (!supabase) return;
    const { error } = await supabase.from('services').update({ is_visible: !s.is_visible }).eq('id', s.id);
    if (error) { toast.error('Failed.'); return; }
    fetchServices();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div><h1 className="font-serif text-3xl text-foreground mb-1">Services</h1><p className="text-sm text-muted-foreground">Manage service offerings displayed on the website.</p></div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90"><Plus className="w-4 h-4" /> Add Service</button>
      </div>
      {loading ? (<div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>) : services.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm"><Briefcase className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" /><p className="text-muted-foreground">No services configured. The site uses default content.</p></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((s) => (
            <div key={s.id} className="bg-card border border-border/40 rounded-sm p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div><span className="text-xs text-primary">{s.number}</span><h3 className="font-serif text-lg text-foreground mt-1">{s.title}</h3></div>
                <div className="flex items-center gap-1">
                  <button onClick={() => toggleVisible(s)} className="p-1.5 text-muted-foreground hover:text-primary">{s.is_visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}</button>
                  <button onClick={() => { setEditing(s); setShowForm(true); }} className="p-1.5 text-muted-foreground hover:text-primary"><Edit2 className="w-3.5 h-3.5" /></button>
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 text-muted-foreground hover:text-destructive"><Trash2 className="w-3.5 h-3.5" /></button>
                </div>
              </div>
              <p className="text-xs text-muted-foreground line-clamp-2">{s.description}</p>
              {s.features.length > 0 && <div className="flex flex-wrap gap-1 mt-3">{s.features.map((f) => <span key={f} className="text-xs px-2 py-0.5 bg-secondary text-muted-foreground rounded-sm">{f}</span>)}</div>}
            </div>
          ))}
        </div>
      )}
      {showForm && <ServiceForm service={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { fetchServices(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ServiceForm({ service, onClose, onSaved }: { service: Service | null; onClose: () => void; onSaved: () => void }) {
  const { supabase } = useSupabase();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    number: service?.number || '',
    title: service?.title || '',
    description: service?.description || '',
    features: (service?.features || []).join(', '),
    display_order: service?.display_order || 0,
    is_visible: service?.is_visible ?? true,
  });

  const handleSave = async () => {
    if (!supabase || !form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    const payload = { number: form.number || null, title: form.title, description: form.description || null, features: form.features.split(',').map((f) => f.trim()).filter(Boolean), display_order: form.display_order, is_visible: form.is_visible };
    const result = service ? await supabase.from('services').update(payload).eq('id', service.id) : await supabase.from('services').insert(payload);
    if (result.error) { setSaving(false); toast.error('Failed to save.'); return; }
    setSaving(false); toast.success(service ? 'Service updated.' : 'Service created.'); onSaved();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border/40 rounded-sm w-full max-w-lg my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="font-serif text-xl text-foreground">{service ? 'Edit Service' : 'New Service'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Number</label><input className={inputClass} value={form.number} onChange={(e) => setForm({ ...form, number: e.target.value })} placeholder="01" /></div>
            <div><label className={labelClass}>Display Order</label><input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
          </div>
          <div><label className={labelClass}>Title *</label><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div><label className={labelClass}>Features (comma-separated)</label><input className={inputClass} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Branding, Campaign planning" /></div>
          <label className="flex items-center gap-2 cursor-pointer"><input type="checkbox" checked={form.is_visible} onChange={(e) => setForm({ ...form, is_visible: e.target.checked })} className="w-4 h-4 accent-primary" /><span className="text-sm text-foreground">Visible on website</span></label>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/30">
          <button onClick={onClose} className="px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:bg-secondary">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 disabled:opacity-50">{saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save</button>
        </div>
      </div>
    </div>
  );
}
