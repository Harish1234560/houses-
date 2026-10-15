'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, Phone, MessageCircle, Mail, Check, ArrowUpRight, Building2, House, Megaphone } from 'lucide-react';
import { COMPANY, WHATSAPP_LINK } from '@/lib/constants';
import { SectionHeading } from '@/components/shared/section-heading';
import { CTAButton } from '@/components/shared/cta-button';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';

const HERO_IMAGE = 'https://images.pexels.com/photos/2771935/pexels-photo-2771935.jpeg?auto=compress&cs=tinysrgb&w=1920';
const MOBILE_HERO_VIDEO = 'https://videos.pexels.com/video-files/7076540/7076540-uhd_1440_2560_24fps.mp4';
const AERIAL_IMAGE = 'https://images.pexels.com/photos/11201060/pexels-photo-11201060.jpeg?auto=compress&cs=tinysrgb&w=1600';
const MARKETING_IMAGE = 'https://images.pexels.com/photos/6476192/pexels-photo-6476192.jpeg?auto=compress&cs=tinysrgb&w=1200';
const VILLA_IMAGE = 'https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&w=1200';
const MYSURU_IMAGE = 'https://images.pexels.com/photos/38192480/pexels-photo-38192480.jpeg?auto=compress&cs=tinysrgb&w=1200';
const HANDSHAKE_IMAGE = 'https://images.pexels.com/photos/8470844/pexels-photo-8470844.jpeg?auto=compress&cs=tinysrgb&w=1200';
const FARMLAND_IMAGE = 'https://images.pexels.com/photos/36832365/pexels-photo-36832365.jpeg?auto=compress&cs=tinysrgb&w=1200';

const SERVICE_IMAGES = [
  'https://images.pexels.com/photos/6476192/pexels-photo-6476192.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/6476187/pexels-photo-6476187.jpeg?auto=compress&cs=tinysrgb&w=800',
  'https://images.pexels.com/photos/8815909/pexels-photo-8815909.jpeg?auto=compress&cs=tinysrgb&w=800',
];
const ROMAN_NUMERALS = ['I', 'II', 'III', 'IV'];
const SERVICE_FOCUS = [
  'Brand & Launch Strategy',
  'Plots, Farmland & Villas',
  'Meta, Google & Ads',
  'Lead Management & Closures',
];
const HERO_HIGHLIGHTS = [
  { title: 'Exclusive project marketing', detail: 'Strategic positioning and promotion', Icon: Building2 },
  { title: 'Residential plot sales', detail: 'Connecting qualified buyers', Icon: House },
  { title: 'Project launch strategy', detail: 'From launch through to booking', Icon: Megaphone },
];

/* Frosted glass panel used ONLY on the transparent sections,
   so text stays readable while the 3D building shows around it. */
const GLASS =
  'rounded-2xl border border-border/60 bg-background/80 backdrop-blur-md shadow-lg shadow-black/5';

type Poster = {
  id: string;
  title: string;
  caption: string | null;
  image_url: string;
  alt_text: string | null;
  category: string | null;
  cta_label: string | null;
  cta_url: string | null;
};

type FeaturedProject = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  category: string | null;
  cover_image_url: string | null;
  project_status: string | null;
};

type FeaturedPackage = {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  features: string[];
};

export default function HomePage() {
  const { supabase } = useSupabase();
  const [posters, setPosters] = useState<Poster[]>([]);
  const [services, setServices] = useState<typeof COMPANY.serviceDetails>([]);
  const [featuredProjects, setFeaturedProjects] = useState<FeaturedProject[]>([]);
  const [featuredPackages, setFeaturedPackages] = useState<FeaturedPackage[]>([]);
  const [hoveredService, setHoveredService] = useState<number | null>(null);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!supabase) return;
    Promise.all([
      supabase
        .from('posters')
        .select('id, title, caption, image_url, alt_text, category, cta_label, cta_url')
        .eq('status', 'published')
        .eq('show_on_homepage', true)
        .order('display_order')
        .limit(6),
      supabase
        .from('services')
        .select('*')
        .eq('is_visible', true)
        .order('display_order'),
      supabase
        .from('projects')
        .select('id, title, slug, location, category, cover_image_url, project_status')
        .eq('status', 'published')
        .eq('is_featured', true)
        .order('display_order')
        .limit(4),
      supabase
        .from('marketing_packages')
        .select('id, name, description, price, features')
        .eq('is_published', true)
        .order('display_order')
        .limit(3),
    ]).then(([posterRes, serviceRes, projectRes, pkgRes]: any[]) => {
      if (posterRes.data) setPosters(posterRes.data);
      if (serviceRes.data && serviceRes.data.length > 0) {
        setServices(serviceRes.data as any);
      }
      if (projectRes.data) setFeaturedProjects(projectRes.data);
      if (pkgRes.data) setFeaturedPackages(pkgRes.data);
    });
  }, [supabase]);

  const displayServices = services.length > 0 ? services : COMPANY.serviceDetails;

  return (
    <>
      {/* HERO — solid photo background */}
      <section
        ref={heroRef}
        id="home-hero"
        className="relative flex min-h-[100svh] flex-col overflow-hidden bg-background lg:min-h-[88svh]"
      >
        <div className="group/hero-image absolute inset-0 z-0 overflow-hidden">
          <Image
            src={HERO_IMAGE}
            alt="Premium architecture — Golden Axis Ventures"
            fill
            priority
            sizes="100vw"
            className="hidden object-cover object-[62%_center] contrast-[1.08] saturate-[0.92] transition-transform ease-out group-hover/hero-image:scale-[1.03] lg:block"
            style={{ transitionDuration: '1400ms' }}
          />
          <video
            className="absolute inset-0 h-full w-full object-cover lg:hidden"
            autoPlay
            muted
            loop
            playsInline
            preload="metadata"
            aria-hidden="true"
            tabIndex={-1}
          >
            <source src={MOBILE_HERO_VIDEO} type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/50 to-black/70 lg:bg-gradient-to-r lg:from-black/70 lg:via-black/50 lg:to-black/20" />
        </div>

        <div className="container relative z-10 mx-auto flex flex-1 items-center px-4 pb-7 pt-28 sm:px-6 lg:px-8 lg:py-24">
          <div className="max-w-[38rem] lg:w-[48%]">
            <div className="mb-4 flex items-center gap-3 sm:mb-6">
              <div className="h-px w-10 bg-bronze-300" />
              <span className="text-[10px] tracking-[0.24em] text-bronze-200 uppercase sm:text-xs sm:tracking-editorial">
                Real Estate Marketing · Mysuru
              </span>
            </div>
            <h1 className="max-w-full font-serif text-[clamp(2.25rem,8.5vw,4.5rem)] leading-[1.05] text-white [text-wrap:balance] lg:leading-[0.94]">
              <span className="block">Your property.</span>
              <span className="mt-1 block text-bronze-200 italic lg:whitespace-nowrap">Our marketing power.</span>
            </h1>
            <p className="mt-5 max-w-lg text-base leading-[1.6] text-white/85 sm:mt-6 sm:leading-7">
              Real estate marketing, project sales and digital growth—connecting developers, investors and homebuyers from Mysuru across South India.
            </p>
            <div className="mt-8 flex flex-col items-stretch gap-3 sm:mt-12 sm:flex-row sm:items-center sm:gap-4">
              <CTAButton href="/services" variant="primary" className="min-h-12 w-full justify-center font-serif text-base tracking-normal sm:w-auto">
                Explore Our Expertise
              </CTAButton>
              <CTAButton href="/contact" variant="outline" className="min-h-12 w-full justify-center border-white/50 bg-white/10 font-serif text-base tracking-normal text-white hover:border-white/70 hover:bg-white/20 hover:text-white sm:w-auto">
                Discuss Your Project
              </CTAButton>
            </div>
            <div className="mt-8 flex items-center gap-2.5 text-sm text-white/80 sm:mt-10">
              <MapPin className="h-4 w-4 shrink-0 text-bronze-200" />
              <span className="min-w-0">Mysuru, Karnataka <span className="px-1 text-bronze-200">·</span> Serving South India</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 w-full">
          <div className="container mx-auto px-4 pb-6 sm:px-6 lg:px-8 lg:pb-8">
            <div className="grid grid-cols-1 overflow-hidden rounded-2xl border border-white/15 bg-black/55 shadow-xl backdrop-blur-md sm:grid-cols-3">
              {HERO_HIGHLIGHTS.map(({ title, detail, Icon }, index) => (
                <div
                  key={title}
                  className={`flex items-center gap-3 px-4 py-3 sm:px-5 sm:py-4 ${
                    index > 0 ? 'border-t border-white/15 sm:border-l sm:border-t-0' : ''
                  }`}
                >
                  <Icon className="h-5 w-5 shrink-0 text-bronze-300" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="font-sans text-sm font-semibold text-white">{title}</p>
                    <p className="mt-0.5 font-sans text-xs text-white/65">{detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* COMPANY OVERVIEW — TRANSPARENT section: 3D building shows through.
          Text lives in frosted glass panels. */}
      <section className="relative bg-transparent py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <Reveal className="lg:col-span-5 lg:sticky lg:top-32">
              <div className={`${GLASS} p-6 lg:p-8`}>
                <span className="section-number">Company overview</span>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground mt-4 leading-tight">
                  A professionally managed marketing firm, <span className="text-primary italic">built on trust</span>
                </h2>
                <div className="mt-8 w-12 h-px bg-primary/40" />
              </div>
            </Reveal>
            <Reveal className="lg:col-span-7" stagger>
              <div className={`${GLASS} p-6 lg:p-8`}>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">
                  Golden Axis Ventures is headquartered in Mysuru, Karnataka, working closely with developers, investors and homebuyers to move real estate projects from launch to closed sale — through strategic marketing, disciplined sales management and genuine customer engagement.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 mb-10">
                  {COMPANY.capabilities.map((cap) => (
                    <div key={cap} className="flex items-center gap-3 text-sm text-foreground/80 group">
                      <Check className="w-4 h-4 text-primary shrink-0 transition-transform group-hover:scale-110" />
                      {cap}
                    </div>
                  ))}
                </div>
                <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-border/40">
                  <Image
                    src={VILLA_IMAGE}
                    alt="Premium property marketing"
                    fill
                    sizes="(max-width: 1024px) 100vw, 60vw"
                    className="object-cover"
                  />
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* WHAT WE DO — SOLID */}
      <section id="home-services" className="py-24 lg:py-32 bg-secondary border-y border-border overflow-hidden">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
              <SectionHeading
                eyebrow="What we do"
                title={<>A complete real estate marketing <span className="text-primary italic">and sales operation</span></>}
                description="Four connected departments carry a project from first campaign to final booking."
              />
              <div className="hidden lg:flex items-center gap-2 text-xs uppercase tracking-wider text-muted-foreground font-mono">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                Hover to explore
              </div>
            </div>
          </Reveal>

          <div
            className="flex flex-col lg:flex-row gap-4 lg:gap-5 w-full items-stretch"
            onMouseLeave={() => setHoveredService(null)}
          >
            {displayServices.slice(0, 4).map((service, i) => {
              const isHovered = hoveredService === i;
              const hasHover = hoveredService !== null;
              const roman = ROMAN_NUMERALS[i] || 'I';
              const focus = SERVICE_FOCUS[i] || 'Strategic Mandate';
              const img = SERVICE_IMAGES[i] || SERVICE_IMAGES[0];

              return (
                <div
                  key={service.number || i}
                  onMouseEnter={() => setHoveredService(i)}
                  onClick={() => setHoveredService(isHovered ? null : i)}
                  className={`group relative overflow-hidden rounded-[28px] border transition-all duration-700 ease-editorial flex flex-col justify-between cursor-pointer p-6 lg:p-7 shadow-lg min-h-[460px] lg:min-h-[500px] ${
                    isHovered
                      ? 'lg:flex-[2.4] bg-[#161617] dark:bg-[#121213] border-primary/70 shadow-2xl shadow-primary/10'
                      : hasHover
                      ? 'lg:flex-[0.8] bg-[#19191c] dark:bg-[#141416] border-border/50'
                      : 'lg:flex-1 bg-[#19191c] dark:bg-[#141416] border-border/60 hover:border-primary/50'
                  }`}
                >
                  <div
                    className={`absolute inset-0 bg-gradient-to-b from-primary/15 via-transparent to-black/60 pointer-events-none transition-opacity duration-700 ${
                      isHovered ? 'opacity-100' : 'opacity-0'
                    }`}
                  />

                  <div className="relative z-10 flex items-start justify-between">
                    <span className="font-serif italic text-3xl lg:text-4xl text-[#c59b6d] select-none transition-transform duration-500 group-hover:scale-110">
                      {roman}
                    </span>
                  </div>

                  <div className="relative z-10 my-4 sm:my-6 w-full h-44 sm:h-48 lg:h-52 rounded-2xl overflow-hidden bg-black/40 border border-white/5 image-zoom-container flex items-center justify-center">
                    <Image
                      src={img}
                      alt={service.title}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                  </div>

                  <div className="relative z-10">
                    <h3 className="font-sans font-bold text-2xl lg:text-3xl text-white tracking-tight leading-tight group-hover:text-[#c59b6d] transition-colors">
                      {service.title}
                    </h3>

                    <div
                      className={`transition-all duration-500 ease-editorial overflow-hidden ${
                        isHovered
                          ? 'max-h-56 opacity-100 mt-3 pt-3 border-t border-white/10'
                          : 'max-h-0 opacity-0 mt-0 lg:overflow-hidden'
                      }`}
                    >
                      <p className="text-sm text-neutral-300 leading-relaxed line-clamp-3 mb-4">
                        {service.description}
                      </p>

                      <div className="flex items-end justify-between pt-2 border-t border-white/10">
                        <div>
                          <div className="text-[10px] tracking-widest uppercase text-[#c59b6d] font-mono font-semibold">
                            SHOWN HERE
                          </div>
                          <div className="text-white text-xs font-medium mt-0.5">
                            {focus}
                          </div>
                        </div>
                        <Link
                          href="/services"
                          className="inline-flex items-center gap-1.5 text-xs font-semibold tracking-wider uppercase text-[#c59b6d] hover:text-white transition-colors group/link shrink-0 ml-3"
                        >
                          EXPLORE
                          <ArrowUpRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-0.5 group-hover/link:-translate-y-0.5" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="mt-14 flex flex-col sm:flex-row items-center justify-center gap-4">
            <CTAButton href="/services" variant="primary">
              Explore All Services
            </CTAButton>
            <CTAButton href="/contact" variant="outline">
              Discuss Your Project
            </CTAButton>
          </div>
        </div>
      </section>

      {/* DIFFERENTIATORS — SOLID */}
      <section className="py-24 lg:py-32 bg-background relative overflow-hidden">
        <div className="absolute inset-0 opacity-[0.07]">
          <Image
            src={AERIAL_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Reveal>
            <SectionHeading
              eyebrow="Why developers work with us"
              title={<>Four things that set our <span className="text-primary italic">approach apart</span></>}
              className="mb-16"
            />
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {COMPANY.differentiators.map((diff) => (
              <Reveal key={diff.number}>
                <div className="bg-card border border-border p-8 lg:p-10 rounded-xl flex gap-6 group hover-lift cursor-default hover:border-primary/50 transition-colors shadow-md">
                  <div className="shrink-0">
                    <span className="font-serif text-5xl text-primary/30 group-hover:text-primary/60 transition-colors duration-500">{diff.number}</span>
                  </div>
                  <div>
                    <span className="text-xs tracking-editorial uppercase text-muted-foreground">{diff.label}</span>
                    <h3 className="font-serif text-xl lg:text-2xl text-foreground mt-2 mb-3">{diff.title}</h3>
                    <p className="text-muted-foreground leading-relaxed text-sm lg:text-base">{diff.description}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* MARKET COVERAGE — SOLID */}
      <section className="py-24 lg:py-32 bg-muted border-y border-border">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal className="relative">
              <div className="relative aspect-[4/5] overflow-hidden rounded-xl border border-border image-zoom-container shadow-md">
                <Image
                  src={MYSURU_IMAGE}
                  alt="Mysuru — home city of Golden Axis Ventures"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 lg:-right-12 bg-card border border-border p-6 rounded-xl shadow-xl hidden sm:block">
                <div className="font-serif text-3xl text-primary">5+</div>
                <div className="text-xs tracking-editorial uppercase text-muted-foreground mt-1">Markets served</div>
              </div>
            </Reveal>
            <Reveal stagger>
              <span className="section-number">Where we work</span>
              <h2 className="font-serif text-3xl lg:text-5xl text-foreground mt-4 leading-tight mb-6">
                Rooted in Mysuru, reaching across <span className="text-primary italic">South India</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Local expertise across our home markets, with a pan-India service for developers and investors beyond them.
              </p>
              <div className="grid grid-cols-2 gap-4">
                {COMPANY.markets.map((market) => (
                  <div key={market.city} className="border border-border bg-card p-5 rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-500 group shadow-sm">
                    <div className="font-serif text-xl text-foreground group-hover:text-primary transition-colors">{market.city}</div>
                    <div className="text-xs text-muted-foreground mt-1">{market.label}</div>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* FEATURED PROJECTS — SOLID */}
      <div id="home-projects" aria-hidden="true" />
      {featuredProjects.length > 0 && (
        <section id="featured-projects" className="py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
                <SectionHeading
                  eyebrow="Portfolio"
                  title={<>Featured <span className="text-primary italic">projects</span></>}
                  description="Property developments and campaigns we currently market."
                />
                <CTAButton href="/projects" variant="ghost">
                  View all projects
                </CTAButton>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6 lg:gap-8">
              {featuredProjects.map((project) => (
                <Reveal key={project.id}>
                  <Link
                    href={`/projects/${project.slug}`}
                    className="group block image-zoom-container rounded-xl overflow-hidden border border-border relative aspect-[16/10] hover-lift hover:border-primary/50 transition-colors shadow-md bg-card"
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
                        <MapPin className="w-10 h-10 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-background/30 to-transparent" />
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      {project.project_status && (
                        <span className="inline-block text-xs px-3 py-1 bg-primary/90 text-primary-foreground border border-primary rounded-full mb-3 shadow-sm">
                          {project.project_status.charAt(0).toUpperCase() + project.project_status.slice(1)}
                        </span>
                      )}
                      <h3 className="font-serif text-xl lg:text-2xl text-foreground mb-1 transition-transform duration-500 group-hover:translate-x-1">
                        {project.title}
                      </h3>
                      {project.location && (
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <MapPin className="w-3.5 h-3.5 text-primary/60" />
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
        </section>
      )}

      {/* MARKETING PACKAGES — SOLID */}
      {featuredPackages.length > 0 && (
        <section className="py-24 lg:py-32 bg-secondary border-y border-border">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
                <SectionHeading
                  eyebrow="Marketing packages"
                  title={<>Packages for <span className="text-primary italic">every stage</span></>}
                  description="From a single listing to a full project launch."
                />
                <CTAButton href="/packages" variant="ghost">
                  See all packages
                </CTAButton>
              </div>
            </Reveal>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
              {featuredPackages.map((pkg, i) => (
                <Reveal key={pkg.id}>
                  <div className={`border rounded-xl p-7 lg:p-8 h-full flex flex-col bg-card shadow-md transition-colors ${i === 0 ? 'border-primary/60 relative' : 'border-border hover:border-primary/50'}`}>
                    {i === 0 && (
                      <span className="absolute -top-3 left-6 text-xs px-3 py-1 bg-primary text-primary-foreground border border-primary rounded-md tracking-wide-sm uppercase shadow-sm">
                        Starting tier
                      </span>
                    )}
                    <h3 className="font-serif text-xl text-foreground mb-2">{pkg.name}</h3>
                    {pkg.price && <p className="text-primary font-medium text-sm mb-3">{pkg.price}</p>}
                    {pkg.description && <p className="text-sm text-muted-foreground leading-relaxed mb-4">{pkg.description}</p>}
                    {pkg.features.length > 0 && (
                      <ul className="space-y-2 mt-auto">
                        {pkg.features.slice(0, 4).map((f) => (
                          <li key={f} className="flex items-center gap-2 text-sm text-foreground/80">
                            <Check className="w-3.5 h-3.5 text-primary shrink-0" />
                            {f}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* POSTER SHOWCASE — SOLID */}
      {posters.length > 0 && (
        <section className="py-24 lg:py-32 bg-background">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <Reveal>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between gap-6 mb-12">
                <SectionHeading
                  eyebrow="Promotional creatives"
                  title={<>Latest campaign <span className="text-primary italic">posters</span></>}
                />
                <CTAButton href="/campaigns" variant="ghost">
                  View all campaigns
                </CTAButton>
              </div>
            </Reveal>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 lg:gap-6">
              {posters.map((poster) => (
                <Reveal key={poster.id}>
                  <Link
                    href={poster.cta_url || '/campaigns'}
                    className="group block image-zoom-container rounded-xl overflow-hidden border border-border bg-card relative aspect-[3/4] shadow-md hover:border-primary/50 transition-colors"
                  >
                    <Image
                      src={poster.image_url}
                      alt={poster.alt_text || poster.title}
                      fill
                      sizes="(max-width: 768px) 50vw, 33vw"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/95 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="absolute bottom-0 left-0 right-0 p-5 translate-y-4 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-500">
                      {poster.category && (
                        <span className="text-xs tracking-editorial uppercase text-primary">{poster.category}</span>
                      )}
                      <h3 className="font-serif text-lg text-foreground mt-1">{poster.title}</h3>
                      {poster.caption && (
                        <p className="text-muted-foreground text-xs mt-1 line-clamp-2">{poster.caption}</p>
                      )}
                    </div>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* GROWTH PLAN — TRANSPARENT section: building shows through.
          Heading and cards sit on frosted glass. */}
      <section className="relative bg-background py-24 lg:py-32">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="mb-12 max-w-3xl rounded-2xl border border-border bg-card p-6 shadow-lg shadow-black/5 lg:p-8">
              <SectionHeading
                eyebrow="Five-year growth plan"
                title={<>From Mysuru leadership to a <span className="text-primary italic">national presence</span></>}
              />
            </div>
          </Reveal>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {COMPANY.growthPlan.map((phase, i) => (
              <Reveal key={phase.phase}>
                <div className="bg-card border border-border rounded-xl p-8 lg:p-10 h-full relative group hover:border-primary/50 transition-colors duration-500 shadow-lg shadow-black/5">
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-xs tracking-editorial uppercase text-primary font-medium">{phase.phase}</span>
                    {i < COMPANY.growthPlan.length - 1 && (
                      <div className="flex-1 h-px bg-border hidden md:block" />
                    )}
                  </div>
                  <h3 className="font-serif text-xl text-foreground mb-3 leading-tight group-hover:text-primary transition-colors">{phase.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed mb-4">{phase.description}</p>
                  {phase.cities && (
                    <div className="flex flex-wrap gap-2">
                      {phase.cities.map((city) => (
                        <span key={city} className="text-xs px-3 py-1 border border-border rounded-md text-muted-foreground group-hover:border-primary/40 transition-colors bg-background">{city}</span>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CONTACT CTA — SOLID over photo */}
      <section className="relative py-24 lg:py-32 overflow-hidden bg-background">
        <div className="absolute inset-0 z-0">
          <Image
            src={HANDSHAKE_IMAGE}
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-background/95" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal>
            <span className="section-number">Get in touch</span>
            <h2 className="font-serif text-4xl lg:text-6xl text-foreground leading-tight mb-6 mt-4">
              Let&apos;s build your <span className="text-primary italic">success</span>
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto mb-10">
              Tell us about your project, and we&apos;ll get back to you with a plan.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3.5 bg-primary text-primary-foreground border border-primary rounded-full text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors group shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Message us on WhatsApp
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </a>
              <a
                href={`mailto:${COMPANY.email}`}
                className="inline-flex items-center gap-2.5 px-7 py-3.5 border border-border bg-card text-foreground rounded-full text-sm font-medium hover:border-primary/60 hover:text-primary transition-colors group shadow-sm"
              >
                <Mail className="w-4 h-4" />
                Email the team
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1.5" />
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}