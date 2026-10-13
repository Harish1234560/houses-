'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { MapPin, ArrowLeft, ArrowRight, Check, Phone } from 'lucide-react';
import { COMPANY, WHATSAPP_LINK } from '@/lib/constants';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';

type Project = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  description: string | null;
  features: string[] | null;
  cover_image_url: string | null;
  brochure_url: string | null;
  project_status: string | null;
};

type GalleryImage = {
  id: string;
  image_url: string;
  alt_text: string | null;
  caption: string | null;
};

type Poster = {
  id: string;
  title: string;
  image_url: string;
  alt_text: string | null;
};

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { supabase } = useSupabase();
  const [project, setProject] = useState<Project | null>(null);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !slug) return;
    Promise.all([
      supabase.from('projects').select('*').eq('slug', slug).eq('status', 'published').maybeSingle(),
      supabase.from('project_galleries').select('id, image_url, alt_text, caption').eq('project_id', project?.id).order('display_order'),
      supabase.from('posters').select('id, title, image_url, alt_text').eq('project_id', project?.id).eq('status', 'published'),
    ]).then(([projRes, galleryRes, posterRes]: any[]) => {
      if (projRes.data) setProject(projRes.data as Project);
      else setLoading(false);
      if (galleryRes.data) setGallery(galleryRes.data);
      if (posterRes.data) setPosters(posterRes.data);
      setLoading(false);
    });
  }, [supabase, slug]);

  useEffect(() => {
    if (!supabase || !project?.id) return;
    Promise.all([
      supabase.from('project_galleries').select('id, image_url, alt_text, caption').eq('project_id', project.id).order('display_order'),
      supabase.from('posters').select('id, title, image_url, alt_text').eq('project_id', project.id).eq('status', 'published'),
    ]).then(([galleryRes, posterRes]: any[]) => {
      if (galleryRes.data) setGallery(galleryRes.data);
      if (posterRes.data) setPosters(posterRes.data);
    });
  }, [supabase, project?.id]);

  if (loading) {
    return (
      <div className="pt-32 pb-16 bg-background min-h-screen">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="aspect-[16/9] bg-card border border-border/20 rounded-sm animate-pulse" />
        </div>
      </div>
    );
  }

  if (!project) {
    notFound();
  }

  return (
    <>
      <section className="relative h-[60vh] min-h-[400px] overflow-hidden">
        {project.cover_image_url ? (
          <Image
            src={project.cover_image_url}
            alt={project.title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-card" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-background/20" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 absolute bottom-0 left-0 right-0 pb-12 z-10">
          <Link
            href="/projects"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground text-sm mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            All projects
          </Link>
          <h1 className="font-serif text-3xl lg:text-5xl text-foreground leading-tight">{project.title}</h1>
          {project.location && (
            <div className="flex items-center gap-2 text-muted-foreground mt-3">
              <MapPin className="w-4 h-4" />
              {project.location}
            </div>
          )}
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            <Reveal className="lg:col-span-8">
              {project.category && (
                <span className="section-number">{project.category}</span>
              )}
              <h2 className="font-serif text-2xl lg:text-3xl text-foreground mt-3 mb-6">About this project</h2>
              <p className="text-muted-foreground text-lg leading-relaxed">
                {project.description || 'Details about this project will be available soon. Please contact us for more information.'}
              </p>

              {project.features && project.features.length > 0 && (
                <div className="mt-10">
                  <h3 className="text-xs tracking-editorial uppercase text-primary mb-4">Features</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {project.features.map((feat) => (
                      <div key={feat} className="flex items-center gap-3 text-sm text-foreground/80">
                        <Check className="w-4 h-4 text-primary shrink-0" />
                        {feat}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {gallery.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs tracking-editorial uppercase text-primary mb-4">Gallery</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {gallery.map((img) => (
                      <div key={img.id} className="image-zoom-container rounded-sm overflow-hidden border border-border/20 relative aspect-[4/3]">
                        <Image
                          src={img.image_url}
                          alt={img.alt_text || ''}
                          fill
                          sizes="(max-width: 768px) 100vw, 50vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {posters.length > 0 && (
                <div className="mt-12">
                  <h3 className="text-xs tracking-editorial uppercase text-primary mb-4">Campaign posters</h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {posters.map((poster) => (
                      <div key={poster.id} className="image-zoom-container rounded-sm overflow-hidden border border-border/20 relative aspect-[3/4]">
                        <Image
                          src={poster.image_url}
                          alt={poster.alt_text || poster.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 33vw"
                          className="object-cover"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Reveal>

            <Reveal className="lg:col-span-4">
              <div className="border border-border bg-card rounded-xl p-6 lg:p-8 sticky top-24 shadow-sm">
                <h3 className="font-serif text-xl text-foreground mb-6">Interested in this project?</h3>
                <p className="text-sm text-muted-foreground mb-6 leading-relaxed">
                  Get in touch to learn more about pricing, site visits and availability.
                </p>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground border border-primary rounded-full text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors mb-3 shadow-sm"
                >
                  <Phone className="w-4 h-4" />
                  Enquire on WhatsApp
                </a>
                <Link
                  href="/contact"
                  className="flex items-center justify-center gap-2 w-full py-3 border border-border text-foreground rounded-full text-sm font-medium hover:border-primary/50 hover:bg-secondary/50 transition-colors shadow-sm"
                >
                  Contact form
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {project.brochure_url && (
                  <a
                    href={project.brochure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 text-sm text-primary hover:text-primary/80 transition-colors mt-3 border border-primary/30 rounded-full shadow-sm"
                  >
                    Download brochure
                  </a>
                )}
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
