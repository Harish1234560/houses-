'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Menu, X, Phone } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NAV_LINKS, COMPANY, WHATSAPP_LINK } from '@/lib/constants';
import { Sheet, SheetContent, SheetTrigger, SheetClose } from '@/components/ui/sheet';
import { ThemeToggle } from '@/components/shared/theme-toggle';
import { useSupabase } from '@/components/providers/supabase-provider';

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const { supabase } = useSupabase();
  const [instagramUrl, setInstagramUrl] = useState<string | null>(null);
  const [whatsappUrl, setWhatsappUrl] = useState(WHATSAPP_LINK);
  const [logoUrl, setLogoUrl] = useState<string | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('social_profiles')
      .select('platform, url, is_visible')
      .eq('is_visible', true)
      .then((res: any) => {
        const insta = res.data?.find((s: any) => s.platform.toLowerCase() === 'instagram');
        const whatsapp = res.data?.find((s: any) => s.platform.toLowerCase() === 'whatsapp');
        if (insta?.url) setInstagramUrl(insta.url);
        if (whatsapp?.url) setWhatsappUrl(whatsapp.url);
      });
    supabase
      .from('site_settings')
      .select('value')
      .eq('key', 'logo_url')
      .maybeSingle()
      .then(({ data }) => setLogoUrl(data?.value || null));
  }, [supabase]);

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-editorial',
        scrolled
          ? 'glass-surface border-b border-border/30 py-3'
          : 'bg-background/75 backdrop-blur-md py-3 sm:py-5'
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group" aria-label="Golden Axis Ventures home">
          {logoUrl ? (
            <span className="relative block h-9 w-36 sm:h-10 sm:w-48">
              <Image src={logoUrl} alt="Golden Axis Ventures" fill unoptimized sizes="(max-width: 640px) 144px, 192px" className="object-contain" />
            </span>
          ) : (
            <>
              <div className="w-9 h-9 rounded-sm border border-primary/40 flex items-center justify-center bg-primary/5 group-hover:bg-primary/10 group-hover:border-primary/60 transition-all duration-500">
                <span className="font-serif text-primary text-lg font-semibold">GA</span>
              </div>
              <div className="hidden sm:block">
                <div className="font-serif text-foreground text-lg leading-tight">Golden Axis</div>
                <div className="text-[0.65rem] tracking-editorial uppercase text-muted-foreground leading-tight">Ventures</div>
              </div>
            </>
          )}
        </Link>

        <div className="hidden lg:flex items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'px-4 py-2 text-sm font-medium tracking-wide-sm transition-colors animated-underline',
                isActive(link.href)
                  ? 'text-primary is-active'
                  : 'text-foreground/70 hover:text-foreground'
              )}
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2">
            {instagramUrl && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#E1306C] hover:border-[#E1306C]/50 transition-colors"
              >
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
          </div>
          <ThemeToggle />
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:inline-flex items-center gap-2 px-6 py-2.5 text-sm font-medium bg-primary text-primary-foreground rounded-full border border-primary shimmer-btn hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Phone className="w-4 h-4" />
            Enquire
          </a>

          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <button
                className="lg:hidden flex h-11 w-11 items-center justify-center rounded-lg p-2 text-foreground border border-border/50 hover:border-primary/50 transition-colors"
                aria-label="Open menu"
              >
                <Menu className="w-6 h-6" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full sm:w-96 bg-card border-border p-0">
              <div className="flex flex-col h-full">
                <div className="flex items-center justify-between p-6 border-b border-border">
                  <span className="font-serif text-lg text-foreground">{COMPANY.name}</span>
                  <SheetClose asChild>
                    <button className="p-2 text-muted-foreground hover:text-foreground transition-colors" aria-label="Close menu">
                      <X className="w-5 h-5" />
                    </button>
                  </SheetClose>
                </div>
                <nav className="flex flex-col p-6 gap-1">
                  {NAV_LINKS.map((link) => (
                    <SheetClose asChild key={link.href}>
                      <Link
                        href={link.href}
                        className={cn(
                          'py-3 px-4 text-base font-medium rounded-sm transition-colors',
                          isActive(link.href)
                            ? 'text-primary bg-primary/10'
                            : 'text-foreground/80 hover:text-foreground hover:bg-secondary'
                        )}
                      >
                        {link.label}
                      </Link>
                    </SheetClose>
                  ))}
                </nav>
                <div className="mt-auto p-6 border-t border-border space-y-3">
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-2 w-full py-3 bg-primary text-primary-foreground rounded-sm text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors"
                  >
                    <Phone className="w-4 h-4" />
                    Enquire on WhatsApp
                  </a>
                  <a
                    href={`tel:${COMPANY.phoneRaw}`}
                    className="flex items-center justify-center gap-2 w-full py-3 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/50 transition-colors"
                  >
                    {COMPANY.phone}
                  </a>
                  {/* Instagram social link */}
                  <div className="flex items-center justify-center gap-3 pt-2">
                    {instagramUrl && (
                      <a
                        href={instagramUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label="Instagram"
                        className="w-10 h-10 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-[#E1306C] hover:border-[#E1306C]/50 transition-colors"
                      >
                        <InstagramIcon className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </nav>
    </header>
  );
}
