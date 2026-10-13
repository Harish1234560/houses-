'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Search, MapPin, ArrowRight, Building2 } from 'lucide-react';
import { COMPANY } from '@/lib/constants';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';
import { cn } from '@/lib/utils';

type Project = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  description: string | null;
  cover_image_url: string | null;
  project_status: string | null;
  is_featured: boolean;
};

const CATEGORIES = ['All', 'Residential', 'Plots', 'Farmland', 'Commercial', 'Investment'];
const STATUS_LABELS: Record<string, string> = {
  ongoing: 'Ongoing',
  completed: 'Completed',
  upcoming: 'Upcoming',
};

export default function ProjectsPage() {
  const { supabase } = useSupabase();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('projects')
      .select('id, title, slug, location, category, description, cover_image_url, project_status, is_featured')
      .eq('status', 'published')
      .order('is_featured', { ascending: false })
      .order('display_order')
      .order('created_at', { ascending: false })
      .then((res: any) => {
        if (res.data) setProjects(res.data);
        setLoading(false);
      });
  }, [supabase]);

  const filtered = projects.filter((p) => {
    const matchesSearch =
      !search ||
      p.title.toLowerCase().includes(search.toLowerCase()) ||
      (p.location || '').toLowerCase().includes(search.toLowerCase());
    const matchesCategory = category === 'All' || p.category === category;
    return matchesSearch && matchesCategory;
  });

  const featured = filtered.filter((p) => p.is_featured);
  const regular = filtered.filter((p) => !p.is_featured);

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">Projects</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              Property developments and <span className="text-primary italic">marketing campaigns</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
              A portfolio of projects we market and sell — from residential plots to premium developments.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 mb-10">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search projects or locations..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors shadow-sm"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategory(cat)}
                  className={cn(
                    'px-5 py-2 text-xs tracking-wide-sm uppercase rounded-full border whitespace-nowrap transition-all duration-300 shadow-sm',
                    category === cat
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground bg-card hover:text-foreground hover:border-primary/40'
                  )}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="aspect-[4/3] bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Building2 className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-foreground mb-2">No projects yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                We&apos;re currently working on new projects that will be showcased here soon. Please check back or contact us for current opportunities.
              </p>
              <Link
                href="/contact"
                className="inline-flex items-center gap-2 mt-6 text-primary text-sm hover:text-primary/80 transition-colors group px-6 py-2.5 border border-primary/40 rounded-full"
              >
                Enquire about projects
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          ) : (
            <>
              {featured.length > 0 && (
                <div className="mb-12">
                  <h2 className="text-xs tracking-editorial uppercase text-primary mb-6">Featured</h2>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
                    {featured.map((project) => (
                      <Reveal key={project.id}>
                        <Link
                          href={`/projects/${project.slug}`}
                          className="group block image-zoom-container rounded-xl overflow-hidden border border-border relative aspect-[16/10] hover-lift hover:border-primary/50 transition-colors shadow-sm bg-card"
                        >
                          {project.cover_image_url ? (
                            <Image
                              src={project.cover_image_url}
                              alt={project.title}
                              fill
                              sizes="(max-width: 1024px) 100vw, 50vw"
                              className="object-cover"
                            />
                          ) : (
                            <div className="absolute inset-0 bg-card flex items-center justify-center">
                              <Building2 className="w-12 h-12 text-muted-foreground/30" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8">
                            {project.project_status && (
                              <span className="inline-block text-xs px-3 py-1 bg-primary/90 text-primary-foreground border border-primary rounded-full mb-3 shadow-sm">
                                {STATUS_LABELS[project.project_status] || project.project_status}
                              </span>
                            )}
                            <h3 className="font-serif text-2xl lg:text-3xl text-foreground mb-2 transition-transform duration-500 group-hover:translate-x-1">{project.title}</h3>
                            {project.location && (
                              <div className="flex items-center gap-2 text-muted-foreground text-sm">
                                <MapPin className="w-4 h-4 text-primary/60" />
                                {project.location}
                              </div>
                            )}
                            <div className="mt-3 inline-flex items-center gap-1.5 text-xs text-primary opacity-0 group-hover:opacity-100 transition-all duration-500">
                              View project
                              <ArrowRight className="w-3 h-3 transition-transform group-hover:translate-x-1" />
                            </div>
                          </div>
                        </Link>
                      </Reveal>
                    ))}
                  </div>
                </div>
              )}

              {regular.length > 0 && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
                  {regular.map((project) => (
                    <Reveal key={project.id}>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="group block image-zoom-container rounded-xl overflow-hidden border border-border relative aspect-[4/3] hover-lift hover:border-primary/50 transition-colors shadow-sm bg-card"
                      >
                        {project.cover_image_url ? (
                          <Image
                            src={project.cover_image_url}
                            alt={project.title}
                            fill
                            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                            className="object-cover"
                          />
                        ) : (
                          <div className="absolute inset-0 bg-card flex items-center justify-center">
                            <Building2 className="w-10 h-10 text-muted-foreground/30" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity duration-500" />
                        <div className="absolute bottom-0 left-0 right-0 p-5">
                          {project.project_status && (
                            <span className="inline-block text-[0.65rem] px-2 py-0.5 bg-primary/80 text-primary-foreground rounded-sm mb-2">
                              {STATUS_LABELS[project.project_status] || project.project_status}
                            </span>
                          )}
                          <h3 className="font-serif text-lg text-foreground mb-1 transition-transform duration-500 group-hover:translate-x-1">{project.title}</h3>
                          {project.location && (
                            <div className="flex items-center gap-1.5 text-muted-foreground text-xs">
                              <MapPin className="w-3 h-3 text-primary/60" />
                              {project.location}
                            </div>
                          )}
                        </div>
                      </Link>
                    </Reveal>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </>
  );
}
