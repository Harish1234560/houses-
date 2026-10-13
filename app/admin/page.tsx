'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Image, FileEdit, Mail, FolderKanban, Calendar, Activity, ArrowRight, Eye } from 'lucide-react';
import { AdminGuard } from '@/components/admin/admin-guard';
import { useSupabase } from '@/components/providers/supabase-provider';
import { useAuth } from '@/components/providers/auth-provider';
import { COMPANY } from '@/lib/constants';

export default function AdminOverviewPage() {
  return (
    <AdminGuard>
      <OverviewContent />
    </AdminGuard>
  );
}

function OverviewContent() {
  const { supabase } = useSupabase();
  const { user } = useAuth();
  const [stats, setStats] = useState({
    publishedPosters: 0,
    draftPosters: 0,
    activeProjects: 0,
    newEnquiries: 0,
  });
  const [recentEnquiries, setRecentEnquiries] = useState<any[]>([]);
  const [scheduledPosts, setScheduledPosts] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase.from('posters').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('posters').select('*', { count: 'exact', head: true }).eq('status', 'draft'),
      supabase.from('projects').select('*', { count: 'exact', head: true }).eq('status', 'published'),
      supabase.from('enquiries').select('id, name, enquiry_type, status, created_at').order('created_at', { ascending: false }).limit(5),
      supabase.from('posters').select('id, title, publish_at').eq('status', 'draft').not('publish_at', 'is', null).order('publish_at').limit(5),
      supabase.from('audit_events').select('id, action, entity_type, created_at').order('created_at', { ascending: false }).limit(5),
    ]).then(([pub, draft, proj, enquiries, scheduled, audit]) => {
      setStats({
        publishedPosters: pub.count || 0,
        draftPosters: draft.count || 0,
        activeProjects: proj.count || 0,
        newEnquiries: enquiries.data?.filter(e => e.status === 'new').length || 0,
      });
      setRecentEnquiries(enquiries.data || []);
      setScheduledPosts(scheduled.data || []);
      setRecentActivity(audit.data || []);
      setLoading(false);
    });
  }, [supabase]);

  const statCards = [
    { label: 'Published Posters', value: stats.publishedPosters, icon: Image, href: '/admin/posters' },
    { label: 'Draft Campaigns', value: stats.draftPosters, icon: FileEdit, href: '/admin/posters' },
    { label: 'Active Projects', value: stats.activeProjects, icon: FolderKanban, href: '/admin/projects' },
    { label: 'New Enquiries', value: stats.newEnquiries, icon: Mail, href: '/admin/enquiries' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-serif text-3xl text-foreground mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground">
          Welcome back{user?.email ? `, ${user.email}` : ''}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.label}
              href={stat.href}
              className="bg-card border border-border/40 rounded-sm p-5 hover:border-primary/30 transition-colors group"
            >
              <div className="flex items-center justify-between mb-3">
                <Icon className="w-5 h-5 text-primary/60" />
                <ArrowRight className="w-4 h-4 text-muted-foreground/30 group-hover:text-primary/60 transition-colors" />
              </div>
              <div className="font-serif text-3xl text-foreground">{stat.value}</div>
              <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
            </Link>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-card border border-border/40 rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-foreground">Recent Enquiries</h2>
            <Link href="/admin/enquiries" className="text-xs text-primary hover:text-primary/80">
              View all
            </Link>
          </div>
          {recentEnquiries.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No enquiries yet.</p>
          ) : (
            <div className="space-y-3">
              {recentEnquiries.map((enq) => (
                <div key={enq.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div>
                    <div className="text-sm text-foreground">{enq.name}</div>
                    <div className="text-xs text-muted-foreground">{enq.enquiry_type}</div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-sm ${
                    enq.status === 'new' ? 'bg-primary/15 text-primary' :
                    enq.status === 'contacted' ? 'bg-blue-500/15 text-blue-400' :
                    enq.status === 'converted' ? 'bg-green-500/15 text-green-400' :
                    'bg-muted text-muted-foreground'
                  }`}>
                    {enq.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-card border border-border/40 rounded-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-lg text-foreground">Upcoming Scheduled Posts</h2>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          {scheduledPosts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">No scheduled posts.</p>
          ) : (
            <div className="space-y-3">
              {scheduledPosts.map((post) => (
                <div key={post.id} className="flex items-center justify-between py-2 border-b border-border/20 last:border-0">
                  <div className="text-sm text-foreground">{post.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {new Date(post.publish_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-card border border-border/40 rounded-sm p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-lg text-foreground">Recent Activity</h2>
          <Activity className="w-4 h-4 text-muted-foreground" />
        </div>
        {recentActivity.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center">No recent activity.</p>
        ) : (
          <div className="space-y-2">
            {recentActivity.map((event) => (
              <div key={event.id} className="flex items-center gap-3 py-2 text-sm">
                <span className="w-2 h-2 bg-primary/40 rounded-full shrink-0" />
                <span className="text-foreground">{event.action}</span>
                {event.entity_type && (
                  <span className="text-xs text-muted-foreground">· {event.entity_type}</span>
                )}
                <span className="text-xs text-muted-foreground ml-auto">
                  {new Date(event.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-card border border-border/40 rounded-sm p-6">
        <h2 className="font-serif text-lg text-foreground mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/posters" className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-sm text-sm font-medium hover:bg-primary/90 transition-colors">
            <Image className="w-4 h-4" />
            New Poster
          </Link>
          <Link href="/admin/projects" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/50 transition-colors">
            <FolderKanban className="w-4 h-4" />
            Add Project
          </Link>
          <Link href="/" target="_blank" className="inline-flex items-center gap-2 px-4 py-2 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/50 transition-colors">
            <Eye className="w-4 h-4" />
            View Site
          </Link>
        </div>
      </div>
    </div>
  );
}
