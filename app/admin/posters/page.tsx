'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Upload, Loader2, Save, Calendar } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Poster = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  alt_text: string | null;
  category: string | null;
  cta_label: string | null;
  cta_url: string | null;
  destination_url: string | null;
  status: string;
  show_on_homepage: boolean;
  show_on_campaigns: boolean;
  show_on_project: boolean;
  display_order: number;
  publish_at: string | null;
  expire_at: string | null;
  file_size: number | null;
  image_width: number | null;
  image_height: number | null;
  created_at: string;
};

const CATEGORIES = ['New Launch', 'Residential Plots', 'Premium', 'Farmland', 'Investment', 'Announcement', 'Festival'];
const STATUSES = ['draft', 'published', 'archived'];

export default function AdminPostersPage() {
  return (
    <AdminGuard>
      <PostersContent />
    </AdminGuard>
  );
}

function PostersContent() {
  const { supabase } = useSupabase();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPoster, setEditingPoster] = useState<Poster | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  const fetchPosters = async () => {
    if (!supabase) return;
    const { data } = await supabase
      .from('posters')
      .select('*')
      .order('display_order')
      .order('created_at', { ascending: false });
    if (data) setPosters(data as Poster[]);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosters();
  }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Delete this poster permanently?')) return;
    const { error } = await supabase.from('posters').delete().eq('id', id);
    if (error) {
      toast.error('Failed to delete poster.');
    } else {
      toast.success('Poster deleted.');
      fetchPosters();
    }
  };

  const toggleStatus = async (poster: Poster) => {
    if (!supabase) return;
    const newStatus = poster.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('posters').update({ status: newStatus }).eq('id', poster.id);
    if (error) {
      toast.error('Failed to update status.');
    } else {
      toast.success(newStatus === 'published' ? 'Poster published.' : 'Poster unpublished.');
      fetchPosters();
    }
  };

  const filtered = filterStatus === 'all' ? posters : posters.filter(p => p.status === filterStatus);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Poster Manager</h1>
          <p className="text-sm text-muted-foreground">Upload, edit and publish promotional posters.</p>
        </div>
        <button
          onClick={() => { setEditingPoster(null); setShowForm(true); }}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Poster
        </button>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
        {['all', ...STATUSES].map((status) => (
          <button
            key={status}
            onClick={() => setFilterStatus(status)}
            className={cn(
              'px-3 py-1.5 text-xs tracking-wide-sm uppercase rounded-sm border whitespace-nowrap transition-colors',
              filterStatus === status
                ? 'bg-primary text-primary-foreground border-primary'
                : 'border-border text-muted-foreground hover:text-foreground'
            )}
          >
            {status}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm">
          <p className="text-muted-foreground mb-4">No posters yet. Upload your first poster to get started.</p>
          <button
            onClick={() => { setEditingPoster(null); setShowForm(true); }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium"
          >
            <Plus className="w-4 h-4" />
            Upload Poster
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {filtered.map((poster) => (
            <div key={poster.id} className="bg-card border border-border/40 rounded-sm overflow-hidden group">
              <div className="relative aspect-[3/4] bg-card">
                <Image
                  src={poster.image_url}
                  alt={poster.alt_text || poster.title}
                  fill
                  sizes="(max-width: 640px) 50vw, 25vw"
                  className="object-cover"
                />
                <div className="absolute top-2 left-2">
                  <span className={cn(
                    'text-[0.65rem] px-2 py-0.5 rounded-sm tracking-wide-sm uppercase',
                    poster.status === 'published' ? 'bg-green-500/80 text-white' :
                    poster.status === 'archived' ? 'bg-muted text-muted-foreground' :
                    'bg-yellow-500/80 text-black'
                  )}>
                    {poster.status}
                  </span>
                </div>
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button
                    onClick={() => { setEditingPoster(poster); setShowForm(true); }}
                    className="p-2 bg-card/80 rounded-sm text-foreground hover:text-primary transition-colors"
                    aria-label="Edit"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => toggleStatus(poster)}
                    className="p-2 bg-card/80 rounded-sm text-foreground hover:text-primary transition-colors"
                    aria-label={poster.status === 'published' ? 'Unpublish' : 'Publish'}
                  >
                    {poster.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(poster.id)}
                    className="p-2 bg-card/80 rounded-sm text-foreground hover:text-destructive transition-colors"
                    aria-label="Delete"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="p-3">
                <h3 className="text-sm text-foreground truncate font-medium">{poster.title}</h3>
                {poster.category && (
                  <p className="text-xs text-muted-foreground mt-0.5">{poster.category}</p>
                )}
                <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                  {poster.show_on_homepage && <span className="px-1.5 py-0.5 bg-primary/10 text-primary rounded-sm">Home</span>}
                  {poster.show_on_campaigns && <span className="px-1.5 py-0.5 bg-secondary text-muted-foreground rounded-sm">Campaigns</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && (
        <PosterForm
          poster={editingPoster}
          onClose={() => { setShowForm(false); setEditingPoster(null); }}
          onSaved={() => { fetchPosters(); setShowForm(false); setEditingPoster(null); }}
        />
      )}
    </div>
  );
}

function PosterForm({ poster, onClose, onSaved }: { poster: Poster | null; onClose: () => void; onSaved: () => void }) {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [imageUrl, setImageUrl] = useState(poster?.image_url || '');
  const [form, setForm] = useState({
    title: poster?.title || '',
    caption: poster?.caption || '',
    alt_text: poster?.alt_text || '',
    category: poster?.category || 'New Launch',
    cta_label: poster?.cta_label || '',
    cta_url: poster?.cta_url || '',
    destination_url: poster?.destination_url || '',
    status: poster?.status || 'draft',
    show_on_homepage: poster?.show_on_homepage || false,
    show_on_campaigns: poster?.show_on_campaigns ?? true,
    show_on_project: poster?.show_on_project || false,
    display_order: poster?.display_order || 0,
    publish_at: poster?.publish_at ? poster.publish_at.slice(0, 16) : '',
    expire_at: poster?.expire_at ? poster.expire_at.slice(0, 16) : '',
  });
  const [fileInfo, setFileInfo] = useState<{ size: number; width: number; height: number } | null>(
    poster ? { size: poster.file_size || 0, width: poster.image_width || 0, height: poster.image_height || 0 } : null
  );

  const handleFileUpload = async (file: File) => {
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

    setUploading(true);
    try {
      const ext = file.type.split('/')[1];
      const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
      const { error } = await supabase.storage
        .from('posters')
        .upload(filename, file, { cacheControl: '3600', contentType: file.type });

      if (error) throw error;

      const { data: urlData } = supabase.storage.from('posters').getPublicUrl(filename);
      const url = urlData.publicUrl;
      const img = new window.Image();
      img.onload = () => setFileInfo({ size: file.size, width: img.naturalWidth, height: img.naturalHeight });
      img.onerror = () => setFileInfo({ size: file.size, width: 0, height: 0 });
      img.src = url;
      setImageUrl(url);
      toast.success('Image uploaded.');
    } catch (error) {
      toast.error(error instanceof Error ? `Upload failed: ${error.message}` : 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!supabase) return;
    if (!form.title.trim()) {
      toast.error('Title is required.');
      return;
    }
    if (!imageUrl) {
      toast.error('Please upload an image.');
      return;
    }

    setSaving(true);
    const payload = {
      title: form.title,
      caption: form.caption || null,
      image_url: imageUrl,
      alt_text: form.alt_text || form.title,
      category: form.category,
      cta_label: form.cta_label || null,
      cta_url: form.cta_url || null,
      destination_url: form.destination_url || null,
      status: form.status,
      show_on_homepage: form.show_on_homepage,
      show_on_campaigns: form.show_on_campaigns,
      show_on_project: form.show_on_project,
      display_order: form.display_order,
      publish_at: form.publish_at ? new Date(form.publish_at).toISOString() : null,
      expire_at: form.expire_at ? new Date(form.expire_at).toISOString() : null,
      file_size: fileInfo?.size || null,
      image_width: fileInfo?.width || null,
      image_height: fileInfo?.height || null,
    };

    let result;
    if (poster) {
      result = await supabase.from('posters').update(payload).eq('id', poster.id);
    } else {
      result = await supabase.from('posters').insert(payload);
    }

    if (result.error) {
      setSaving(false);
      toast.error('Failed to save poster.');
      return;
    }

    if (supabase && user) {
      await supabase.from('audit_events').insert({
        actor_email: user.email,
        action: poster ? 'Updated poster' : 'Created poster',
        entity_type: 'poster',
        details: form.title,
      });
    }

    setSaving(false);
    toast.success(poster ? 'Poster updated.' : 'Poster created.');
    onSaved();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border/40 rounded-sm w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="font-serif text-xl text-foreground">{poster ? 'Edit Poster' : 'New Poster'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Image upload */}
          <div>
            <label className={labelClass}>Poster Image *</label>
            {imageUrl ? (
              <div className="relative aspect-[3/4] max-w-[200px] rounded-sm overflow-hidden border border-border/40">
                <Image src={imageUrl} alt="Preview" fill className="object-cover" sizes="200px" />
                <button
                  onClick={() => { setImageUrl(''); setFileInfo(null); }}
                  className="absolute top-2 right-2 p-1.5 bg-background/80 rounded-sm text-foreground hover:text-destructive"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full max-w-[200px] aspect-[3/4] border-2 border-dashed border-border rounded-sm flex flex-col items-center justify-center gap-2 text-muted-foreground hover:border-primary/40 transition-colors"
              >
                {uploading ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <>
                    <Upload className="w-6 h-6" />
                    <span className="text-xs">Click to upload</span>
                  </>
                )}
              </button>
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileUpload(file);
                e.currentTarget.value = '';
              }}
            />
            {fileInfo && fileInfo.width > 0 && (
              <p className="text-xs text-muted-foreground mt-2">
                {fileInfo.width} × {fileInfo.height}px · {(fileInfo.size / 1024).toFixed(0)} KB
              </p>
            )}
          </div>

          <div>
            <label className={labelClass}>Title *</label>
            <input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Poster title" />
          </div>

          <div>
            <label className={labelClass}>Caption</label>
            <textarea className={inputClass} rows={2} value={form.caption} onChange={(e) => setForm({ ...form, caption: e.target.value })} placeholder="Short description" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Category</label>
              <select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className={labelClass}>Status</label>
              <select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>CTA Label</label>
              <input className={inputClass} value={form.cta_label} onChange={(e) => setForm({ ...form, cta_label: e.target.value })} placeholder="View Project" />
            </div>
            <div>
              <label className={labelClass}>CTA URL</label>
              <input className={inputClass} value={form.cta_url} onChange={(e) => setForm({ ...form, cta_url: e.target.value })} placeholder="/projects/..." />
            </div>
          </div>

          <div>
            <label className={labelClass}>Alt Text (accessibility)</label>
            <input className={inputClass} value={form.alt_text} onChange={(e) => setForm({ ...form, alt_text: e.target.value })} placeholder="Describe the image" />
          </div>

          <div>
            <label className={labelClass}>Display Order</label>
            <input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={labelClass}>Publish Date</label>
              <input type="datetime-local" className={inputClass} value={form.publish_at} onChange={(e) => setForm({ ...form, publish_at: e.target.value })} />
            </div>
            <div>
              <label className={labelClass}>Expiry Date</label>
              <input type="datetime-local" className={inputClass} value={form.expire_at} onChange={(e) => setForm({ ...form, expire_at: e.target.value })} />
            </div>
          </div>

          <div className="space-y-2">
            <label className={labelClass}>Display On</label>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_on_homepage} onChange={(e) => setForm({ ...form, show_on_homepage: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Homepage</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_on_campaigns} onChange={(e) => setForm({ ...form, show_on_campaigns: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Campaigns page</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.show_on_project} onChange={(e) => setForm({ ...form, show_on_project: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Project page</span>
              </label>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/30">
          <button onClick={onClose} className="px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:bg-secondary transition-colors">
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {poster ? 'Save Changes' : 'Create Poster'}
          </button>
        </div>
      </div>
    </div>
  );
}
