'use client';

import { useEffect, useState } from 'react';
import { Search, Mail, Phone, Calendar, MessageSquare, Download, X, Save, Loader2 } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

type Enquiry = {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  enquiry_type: string;
  project_location: string | null;
  service_required: string | null;
  estimated_budget: string | null;
  message: string | null;
  status: string;
  follow_up_date: string | null;
  created_at: string;
};

type EnquiryNote = {
  id: string;
  note: string;
  created_at: string;
};

const ENQUIRY_STATUSES = ['new', 'contacted', 'qualified', 'site_visit', 'converted', 'closed'];
const STATUS_COLORS: Record<string, string> = {
  new: 'bg-primary/15 text-primary',
  contacted: 'bg-blue-500/15 text-blue-400',
  qualified: 'bg-cyan-500/15 text-cyan-400',
  site_visit: 'bg-orange-500/15 text-orange-400',
  converted: 'bg-green-500/15 text-green-400',
  closed: 'bg-muted text-muted-foreground',
};

export default function AdminEnquiriesPage() {
  return (
    <AdminGuard><EnquiriesContent /></AdminGuard>
  );
}

function EnquiriesContent() {
  const { supabase } = useSupabase();
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Enquiry | null>(null);
  const [notes, setNotes] = useState<EnquiryNote[]>([]);
  const [newNote, setNewNote] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');

  const fetchEnquiries = async () => {
    if (!supabase) return;
    const { data } = await supabase.from('enquiries').select('*').order('created_at', { ascending: false });
    if (data) setEnquiries(data as Enquiry[]);
    setLoading(false);
  };

  useEffect(() => { fetchEnquiries(); }, [supabase]);

  const fetchNotes = async (enquiryId: string) => {
    if (!supabase) return;
    const { data } = await supabase.from('enquiry_notes').select('id, note, created_at').eq('enquiry_id', enquiryId).order('created_at', { ascending: false });
    if (data) setNotes(data as EnquiryNote[]);
  };

  const openEnquiry = (enquiry: Enquiry) => {
    setSelected(enquiry);
    setFollowUpDate(enquiry.follow_up_date || '');
    fetchNotes(enquiry.id);
  };

  const updateStatus = async (enquiry: Enquiry, status: string) => {
    if (!supabase) return;
    const { error } = await supabase.from('enquiries').update({ status }).eq('id', enquiry.id);
    if (error) { toast.error('Failed to update status.'); return; }
    toast.success('Status updated.');
    fetchEnquiries();
    if (selected?.id === enquiry.id) setSelected({ ...enquiry, status });
  };

  const saveFollowUp = async () => {
    if (!supabase || !selected) return;
    const { error } = await supabase.from('enquiries').update({ follow_up_date: followUpDate || null }).eq('id', selected.id);
    if (error) { toast.error('Failed to save.'); return; }
    toast.success('Follow-up date saved.');
    fetchEnquiries();
  };

  const addNote = async () => {
    if (!supabase || !selected || !newNote.trim()) return;
    const { data, error } = await supabase.from('enquiry_notes').insert({ enquiry_id: selected.id, note: newNote }).select('id, note, created_at').single();
    if (error) { toast.error('Failed to add note.'); return; }
    setNotes([data as EnquiryNote, ...notes]);
    setNewNote('');
    toast.success('Note added.');
  };

  const exportCSV = () => {
    const headers = ['Name', 'Phone', 'Email', 'Type', 'Service', 'Location', 'Budget', 'Status', 'Date'];
    const rows = filtered.map((e) => [e.name, e.phone, e.email || '', e.enquiry_type, e.service_required || '', e.project_location || '', e.estimated_budget || '', e.status, new Date(e.created_at).toLocaleDateString()]);
    const csv = [headers, ...rows].map((r) => r.map((c) => `"${c}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = `enquiries-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = enquiries.filter((e) => {
    const matchesSearch = !search || e.name.toLowerCase().includes(search.toLowerCase()) || e.phone.includes(search);
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl text-foreground mb-1">Enquiries</h1>
          <p className="text-sm text-muted-foreground">Manage leads and follow-ups.</p>
        </div>
        <button onClick={exportCSV} disabled={filtered.length === 0} className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/50 transition-colors disabled:opacity-50">
          <Download className="w-4 h-4" /> Export CSV
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input type="text" placeholder="Search by name or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {['all', ...ENQUIRY_STATUSES].map((status) => (
            <button key={status} onClick={() => setStatusFilter(status)} className={cn('px-3 py-1.5 text-xs tracking-wide-sm uppercase rounded-sm border whitespace-nowrap transition-colors', statusFilter === status ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{status}</button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="w-6 h-6 text-primary animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-24 bg-card border border-border/40 rounded-sm">
          <Mail className="w-10 h-10 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground">No enquiries found.</p>
        </div>
      ) : (
        <div className="bg-card border border-border/40 rounded-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-xs tracking-wide-sm uppercase text-muted-foreground p-4">Name</th>
                  <th className="text-left text-xs tracking-wide-sm uppercase text-muted-foreground p-4 hidden md:table-cell">Type</th>
                  <th className="text-left text-xs tracking-wide-sm uppercase text-muted-foreground p-4 hidden lg:table-cell">Service</th>
                  <th className="text-left text-xs tracking-wide-sm uppercase text-muted-foreground p-4">Status</th>
                  <th className="text-left text-xs tracking-wide-sm uppercase text-muted-foreground p-4 hidden sm:table-cell">Date</th>
                  <th className="p-4"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((enq) => (
                  <tr key={enq.id} className="border-b border-border/20 last:border-0 hover:bg-secondary/30 cursor-pointer" onClick={() => openEnquiry(enq)}>
                    <td className="p-4">
                      <div className="text-sm text-foreground font-medium">{enq.name}</div>
                      <div className="text-xs text-muted-foreground">{enq.phone}</div>
                    </td>
                    <td className="p-4 hidden md:table-cell"><span className="text-sm text-muted-foreground">{enq.enquiry_type}</span></td>
                    <td className="p-4 hidden lg:table-cell"><span className="text-sm text-muted-foreground">{enq.service_required}</span></td>
                    <td className="p-4"><span className={cn('text-xs px-2 py-1 rounded-sm', STATUS_COLORS[enq.status] || 'bg-muted text-muted-foreground')}>{enq.status}</span></td>
                    <td className="p-4 hidden sm:table-cell"><span className="text-xs text-muted-foreground">{new Date(enq.created_at).toLocaleDateString()}</span></td>
                    <td className="p-4"><button className="text-xs text-primary hover:text-primary/80">View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selected && (
        <div className="fixed inset-0 z-50 bg-background/80 flex items-start lg:items-center justify-center p-4 overflow-y-auto" onClick={() => setSelected(null)}>
          <div className="bg-card border border-border/40 rounded-sm w-full max-w-2xl my-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-border/30">
              <h2 className="font-serif text-xl text-foreground">{selected.name}</h2>
              <button onClick={() => setSelected(null)} className="p-2 text-muted-foreground hover:text-foreground"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex items-center gap-3"><Phone className="w-4 h-4 text-primary/60" /><a href={`tel:${selected.phone}`} className="text-sm text-foreground hover:text-primary">{selected.phone}</a></div>
                {selected.email && <div className="flex items-center gap-3"><Mail className="w-4 h-4 text-primary/60" /><a href={`mailto:${selected.email}`} className="text-sm text-foreground hover:text-primary">{selected.email}</a></div>}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                <div><span className="text-xs text-muted-foreground uppercase">Type</span><div className="text-foreground mt-1">{selected.enquiry_type}</div></div>
                <div><span className="text-xs text-muted-foreground uppercase">Service</span><div className="text-foreground mt-1">{selected.service_required}</div></div>
                <div><span className="text-xs text-muted-foreground uppercase">Location</span><div className="text-foreground mt-1">{selected.project_location || '—'}</div></div>
                <div><span className="text-xs text-muted-foreground uppercase">Budget</span><div className="text-foreground mt-1">{selected.estimated_budget || '—'}</div></div>
              </div>
              {selected.message && (
                <div><span className="text-xs text-muted-foreground uppercase">Message</span><p className="text-sm text-foreground mt-1 leading-relaxed">{selected.message}</p></div>
              )}

              <div>
                <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">Status</label>
                <div className="flex flex-wrap gap-2">
                  {ENQUIRY_STATUSES.map((status) => (
                    <button key={status} onClick={() => updateStatus(selected, status)} className={cn('px-3 py-1.5 text-xs rounded-sm border transition-colors', selected.status === status ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground')}>{status}</button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">Follow-up Date</label>
                <div className="flex items-center gap-3">
                  <div className="relative flex-1">
                    <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <input type="date" value={followUpDate} onChange={(e) => setFollowUpDate(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-card border border-border rounded-sm text-sm text-foreground focus:border-primary/50 focus:outline-none" />
                  </div>
                  <button onClick={saveFollowUp} className="inline-flex items-center gap-2 px-3 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-medium hover:bg-primary/90"><Save className="w-3.5 h-3.5" /> Save</button>
                </div>
              </div>

              <div>
                <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">Internal Notes</label>
                <div className="flex gap-2 mb-3">
                  <input type="text" value={newNote} onChange={(e) => setNewNote(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && addNote()} placeholder="Add a note..." className="flex-1 px-3 py-2 bg-card border border-border rounded-sm text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none" />
                  <button onClick={addNote} className="px-3 py-2 bg-primary text-primary-foreground rounded-sm text-xs font-medium hover:bg-primary/90">Add</button>
                </div>
                {notes.length > 0 && (
                  <div className="space-y-2">
                    {notes.map((note) => (
                      <div key={note.id} className="flex items-start gap-3 p-3 bg-card/50 rounded-sm">
                        <MessageSquare className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                        <div>
                          <p className="text-sm text-foreground">{note.note}</p>
                          <p className="text-xs text-muted-foreground mt-1">{new Date(note.created_at).toLocaleString()}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
