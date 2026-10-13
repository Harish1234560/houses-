'use client';

import { useEffect, useState, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Tag, X, ChevronLeft, ChevronRight } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';
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
  created_at: string;
};

const CATEGORIES = [
  'All',
  'New Launch',
  'Residential Plots',
  'Premium',
  'Farmland',
  'Investment',
  'Announcement',
  'Festival',
];

export default function CampaignsPage() {
  const { supabase } = useSupabase();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('posters')
      .select('id, title, caption, image_url, alt_text, category, cta_label, cta_url, created_at')
      .eq('status', 'published')
      .eq('show_on_campaigns', true)
      .order('display_order')
      .order('created_at', { ascending: false })
      .then((res: any) => {
        if (res.data) setPosters(res.data);
        setLoading(false);
      });
  }, [supabase]);

  const filtered = category === 'All' ? posters : posters.filter((p) => p.category === category);

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const prevPoster = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev - 1 + filtered.length) % filtered.length));
  }, [filtered.length]);
  const nextPoster = useCallback(() => {
    setLightboxIndex((prev) => (prev === null ? null : (prev + 1) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') prevPoster();
      if (e.key === 'ArrowRight') nextPoster();
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightboxIndex, closeLightbox, prevPoster, nextPoster]);

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">Campaigns</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              Promotional creatives and <span className="text-primary italic">campaign posters</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
              A visual gallery of our latest marketing campaigns, property launches and seasonal creatives. Click any poster to view it in full.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-12 lg:py-16 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar mb-10 pb-2">
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

          {loading ? (
            <div className="masonry-grid">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="masonry-item">
                  <div className="bg-card border border-border rounded-2xl animate-pulse aspect-[3/4]" />
                </div>
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24">
              <Tag className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <h3 className="font-serif text-2xl text-foreground mb-2">No campaigns yet</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Campaign posters will appear here once they are published. Check back soon for our latest creatives.
              </p>
            </div>
          ) : (
            <div className="masonry-grid">
              {filtered.map((poster, i) => (
                <Reveal key={poster.id} className="masonry-item">
                  <div
                    className="group block rounded-2xl overflow-hidden border border-border bg-card relative cursor-pointer shadow-sm hover:border-primary/50 transition-colors"
                    onClick={() => setLightboxIndex(i)}
                  >
                    <div className="image-zoom-container">
                      <Image
                        src={poster.image_url}
                        alt={poster.alt_text || poster.title}
                        width={600}
                        height={800}
                        className="w-full h-auto"
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      {poster.category && (
                        <span className="text-xs tracking-editorial uppercase text-primary">{poster.category}</span>
                      )}
                      <h3 className="font-serif text-lg text-foreground mt-1">{poster.title}</h3>
                      {poster.caption && (
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{poster.caption}</p>
                      )}
                      {poster.cta_label && poster.cta_url && (
                        <span
                          className="inline-flex items-center gap-1.5 text-xs text-primary mt-3"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Link href={poster.cta_url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            {poster.cta_label}
                          </Link>
                          <ArrowRight className="w-3 h-3" />
                        </span>
                      )}
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Lightbox */}
      {lightboxIndex !== null && filtered[lightboxIndex] && (
        <div className="lightbox-overlay" onClick={closeLightbox}>
          <button
            className="absolute top-6 right-6 p-3 text-foreground/60 hover:text-foreground transition-colors z-10"
            onClick={closeLightbox}
            aria-label="Close"
          >
            <X className="w-6 h-6" />
          </button>
          <button
            className="absolute left-4 lg:left-8 p-3 text-foreground/60 hover:text-foreground transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); prevPoster(); }}
            aria-label="Previous"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          <div
            className="relative max-w-3xl max-h-[85vh] flex flex-col items-center"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={filtered[lightboxIndex].image_url}
              alt={filtered[lightboxIndex].alt_text || filtered[lightboxIndex].title}
              width={800}
              height={1000}
              className="max-h-[75vh] w-auto object-contain rounded-sm"
            />
            <div className="mt-4 text-center">
              {filtered[lightboxIndex].category && (
                <span className="text-xs tracking-editorial uppercase text-primary">{filtered[lightboxIndex].category}</span>
              )}
              <h3 className="font-serif text-xl text-foreground mt-1">{filtered[lightboxIndex].title}</h3>
              {filtered[lightboxIndex].caption && (
                <p className="text-muted-foreground text-sm mt-1 max-w-md">{filtered[lightboxIndex].caption}</p>
              )}
            </div>
          </div>
          <button
            className="absolute right-4 lg:right-8 p-3 text-foreground/60 hover:text-foreground transition-colors z-10"
            onClick={(e) => { e.stopPropagation(); nextPoster(); }}
            aria-label="Next"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
        </div>
      )}
    </>
  );
}
