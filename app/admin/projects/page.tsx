'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { Plus, Edit2, Trash2, X, Save, Loader2, Star, Building2 } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  description: string | null;
  features: string[];
  cover_image_url: string | null;
  brochure_url: string | null;
  status: string;
  is_featured: boolean;
  display_order: number;
  project_status: string | null;
};

const CATEGORIES = ['Residential', 'Plots', 'Farmland', 'Commercial', 'Investment'];
const PROJECT_STATUSES = ['ongoing', 'completed', 'upcoming'];
const STATUSES = ['draft', 'published'];

export default function AdminProjectsPage() {
  return (
    <AdminGuard><ProjectsContent /></AdminGuard>
  );
}

function ProjectsContent() {
  const { supabase } = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Project | null>(null);

  const fetchProjects = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('projects').select('*').order('display_order').order('created_at', { ascending: false });
    if (data) setProjects(data as Project[]);
    setLoading(false);
  };

  useEffect(() => { fetchProjects(); }, [supabase]);

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    if (!confirm('Delete this project?')) return;
    const { error } = await supabase.from('projects').delete().eq('id', id);
    if (error) { toast.error('Failed to delete.'); return; }
    toast.success('Project deleted.');
    fetchProjects();
  };

  const toggleFeatured = async (project: Project) => {
    if (!supabase) return;
    const { error } = await supabase.from('projects').update({ is_featured: !project.is_featured }).eq('id', project.id);
    if (error) { toast.error('Failed.'); return; }
    fetchProjects();
  };

  const toggleStatus = async (project: Project) => {
    if (!supabase) return;
    const newStatus = project.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase.from('projects').update({ status: newStatus }).eq('id', project.id);
    if (error) { toast.error('Failed.'); return; }
    toast.success(newStatus === 'published' ? 'Project published.' : 'Project unpublished.');
    fetchProjects();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Projects</h1>
          <p className="text-sm text-muted-foreground">Manage property developments and campaigns.</p>
        </div>
        <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2.5 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm">
          <Building2 className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground mb-4">No projects yet.</p>
          <button onClick={() => { setEditing(null); setShowForm(true); }} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium">
            <Plus className="w-4 h-4" /> Add First Project
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.map((project) => (
            <div key={project.id} className="bg-card border border-border/40 rounded-sm overflow-hidden group">
              <div className="relative aspect-[16/10] bg-card">
                {project.cover_image_url ? (
                  <Image src={project.cover_image_url} alt={project.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full"><Building2 className="w-8 h-8 text-muted-foreground/30" /></div>
                )}
                <div className="absolute top-2 left-2 flex gap-1">
                  <span className={cn('text-[0.65rem] px-2 py-0.5 rounded-sm tracking-wide-sm uppercase', project.status === 'published' ? 'bg-green-500/80 text-white' : 'bg-yellow-500/80 text-black')}>{project.status}</span>
                  {project.is_featured && <span className="text-[0.65rem] px-2 py-0.5 rounded-sm bg-primary/80 text-primary-foreground uppercase">Featured</span>}
                </div>
                <div className="absolute inset-0 bg-background/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                  <button onClick={() => { setEditing(project); setShowForm(true); }} className="p-2 bg-card/80 rounded-sm text-foreground hover:text-primary"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => toggleFeatured(project)} className="p-2 bg-card/80 rounded-sm text-foreground hover:text-primary"><Star className={cn('w-4 h-4', project.is_featured && 'fill-primary text-primary')} /></button>
                  <button onClick={() => toggleStatus(project)} className="p-2 bg-card/80 rounded-sm text-foreground hover:text-primary text-xs px-3">{project.status === 'published' ? 'Unpublish' : 'Publish'}</button>
                  <button onClick={() => handleDelete(project.id)} className="p-2 bg-card/80 rounded-sm text-foreground hover:text-destructive"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-4">
                <h3 className="text-sm text-foreground font-medium truncate">{project.title}</h3>
                {project.location && <p className="text-xs text-muted-foreground mt-0.5">{project.location}</p>}
                {project.category && <p className="text-xs text-primary mt-1">{project.category}</p>}
              </div>
            </div>
          ))}
        </div>
      )}

      {showForm && <ProjectForm project={editing} onClose={() => { setShowForm(false); setEditing(null); }} onSaved={() => { fetchProjects(); setShowForm(false); setEditing(null); }} />}
    </div>
  );
}

function ProjectForm({ project, onClose, onSaved }: { project: Project | null; onClose: () => void; onSaved: () => void }) {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    title: project?.title || '',
    slug: project?.slug || '',
    location: project?.location || '',
    category: project?.category || 'Residential',
    description: project?.description || '',
    features: (project?.features || []).join(', '),
    cover_image_url: project?.cover_image_url || '',
    brochure_url: project?.brochure_url || '',
    status: project?.status || 'draft',
    is_featured: project?.is_featured || false,
    display_order: project?.display_order || 0,
    project_status: project?.project_status || 'ongoing',
  });

  const handleSave = async () => {
    if (!supabase) return;
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    let slug = form.slug || form.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!slug) { toast.error('Could not generate slug.'); return; }

    setSaving(true);
    const payload = {
      title: form.title,
      slug,
      location: form.location || null,
      category: form.category,
      description: form.description || null,
      features: form.features.split(',').map((f) => f.trim()).filter(Boolean),
      cover_image_url: form.cover_image_url || null,
      brochure_url: form.brochure_url || null,
      status: form.status,
      is_featured: form.is_featured,
      display_order: form.display_order,
      project_status: form.project_status,
    };

    let result;
    if (project) {
      result = await supabase.from('projects').update(payload).eq('id', project.id);
    } else {
      result = await supabase.from('projects').insert(payload);
    }

    if (result.error) {
      setSaving(false);
      toast.error(result.error.message.includes('duplicate') ? 'A project with this slug already exists.' : 'Failed to save project.');
      return;
    }

    if (user) {
      await supabase.from('audit_events').insert({ actor_email: user.email, action: project ? 'Updated project' : 'Created project', entity_type: 'project', details: form.title });
    }

    setSaving(false);
    toast.success(project ? 'Project updated.' : 'Project created.');
    onSaved();
  };

  const inputClass = 'w-full px-3 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors';
  const labelClass = 'block text-xs tracking-wide-sm uppercase text-muted-foreground mb-1.5';

  return (
    <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto">
      <div className="bg-card border border-border/40 rounded-sm w-full max-w-2xl my-8">
        <div className="flex items-center justify-between p-6 border-b border-border/30">
          <h2 className="font-serif text-xl text-foreground">{project ? 'Edit Project' : 'New Project'}</h2>
          <button onClick={onClose} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
        </div>
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          <div><label className={labelClass}>Title *</label><input className={inputClass} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Project name" /></div>
          <div><label className={labelClass}>Slug (URL)</label><input className={inputClass} value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="auto-generated from title" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Location</label><input className={inputClass} value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="City, State" /></div>
            <div><label className={labelClass}>Category</label><select className={inputClass} value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>{CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Project Status</label><select className={inputClass} value={form.project_status} onChange={(e) => setForm({ ...form, project_status: e.target.value })}>{PROJECT_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
            <div><label className={labelClass}>Visibility</label><select className={inputClass} value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div><label className={labelClass}>Description</label><textarea className={inputClass} rows={4} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Project description" /></div>
          <div><label className={labelClass}>Features (comma-separated)</label><input className={inputClass} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Gated, Clubhouse, Wide Roads" /></div>
          <div><label className={labelClass}>Cover Image URL</label><input className={inputClass} value={form.cover_image_url} onChange={(e) => setForm({ ...form, cover_image_url: e.target.value })} placeholder="https://..." /></div>
          <div><label className={labelClass}>Brochure URL (optional)</label><input className={inputClass} value={form.brochure_url} onChange={(e) => setForm({ ...form, brochure_url: e.target.value })} placeholder="https://..." /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className={labelClass}>Display Order</label><input type="number" className={inputClass} value={form.display_order} onChange={(e) => setForm({ ...form, display_order: parseInt(e.target.value) || 0 })} /></div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 cursor-pointer pb-2.5">
                <input type="checkbox" checked={form.is_featured} onChange={(e) => setForm({ ...form, is_featured: e.target.checked })} className="w-4 h-4 accent-primary" />
                <span className="text-sm text-foreground">Featured project</span>
              </label>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-3 p-6 border-t border-border/30">
          <button onClick={onClose} className="px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:bg-secondary transition-colors">Cancel</button>
          <button onClick={handleSave} disabled={saving} className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} {project ? 'Save Changes' : 'Create Project'}
          </button>
        </div>
      </div>
    </div>
  );
}
