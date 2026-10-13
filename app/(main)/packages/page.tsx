'use client';

import { useEffect, useState } from 'react';
import { Check, MessageCircle, Info } from 'lucide-react';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';
import { WHATSAPP_PACKAGES_LINK } from '@/lib/constants';
import { SectionHeading } from '@/components/shared/section-heading';

type Package = {
  id: string;
  name: string;
  description: string | null;
  features: string[];
  price: string | null;
  notes: string | null;
  display_order: number;
};

export default function PackagesPage() {
  const { supabase } = useSupabase();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('marketing_packages')
      .select('id, name, description, features, price, notes, display_order')
      .eq('is_published', true)
      .order('display_order')
      .then((res: any) => {
        if (res.data) setPackages(res.data);
        setLoading(false);
      });
  }, [supabase]);

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">Marketing packages</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              Packages built for <span className="text-primary italic">every stage of a project</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Five tiers, from a single property listing to a full project launch — each one covers strategy, content, digital advertising, lead management and sales support.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="border border-border rounded-xl p-6 lg:p-8 mb-12 bg-card flex flex-col lg:flex-row items-start lg:items-center gap-4 lg:gap-8 shadow-sm">
            <div className="flex items-start gap-3 flex-1">
              <Info className="w-5 h-5 text-primary/60 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm text-foreground/80">
                  <span className="text-primary font-medium">Success fee:</span> 2% of transaction value, where agreed.
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Advertising budget is separate and paid by the client.
                </p>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-80 bg-card border border-border rounded-xl animate-pulse" />
              ))}
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-24">
              <h3 className="font-serif text-2xl text-foreground mb-2">Packages coming soon</h3>
              <p className="text-muted-foreground max-w-md mx-auto mb-6">
                Our marketing package details are being updated. Please contact us directly for a tailored quote.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {packages.map((pkg, i) => (
                <Reveal key={pkg.id}>
                  <div
                    className={`border rounded-xl p-6 lg:p-8 h-full flex flex-col transition-colors shadow-sm bg-card ${
                      i === 0
                        ? 'border-primary/60 relative'
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {i === 0 && (
                      <span className="absolute -top-3 left-6 text-xs px-3 py-1 bg-primary text-primary-foreground border border-primary rounded-md tracking-wide-sm uppercase shadow-sm">
                        Starting tier
                      </span>
                    )}
                    <h3 className="font-serif text-2xl text-foreground mb-3">{pkg.name}</h3>
                    {pkg.description && (
                      <p className="text-sm text-muted-foreground leading-relaxed mb-6">{pkg.description}</p>
                    )}
                    {pkg.price && (
                      <div className="mb-6">
                        <span className="font-serif text-3xl text-primary">{pkg.price}</span>
                      </div>
                    )}
                    {pkg.features && pkg.features.length > 0 && (
                      <ul className="space-y-3 mb-8 flex-1">
                        {pkg.features.map((feat) => (
                          <li key={feat} className="flex items-start gap-3 text-sm text-foreground/80">
                            <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                            {feat}
                          </li>
                        ))}
                      </ul>
                    )}
                    <a
                      href={WHATSAPP_PACKAGES_LINK}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full py-3 border border-border text-foreground rounded-full text-sm font-medium hover:border-primary/60 hover:text-primary transition-colors bg-background/50 shadow-sm"
                    >
                      <MessageCircle className="w-4 h-4" />
                      Enquire about this package
                    </a>
                  </div>
                </Reveal>
              ))}
            </div>
          )}

          <div className="mt-16 text-center border-t border-border/30 pt-12">
            <Reveal>
              <SectionHeading
                eyebrow="Not sure which package fits?"
                title="Send us a few details on WhatsApp"
                description="We'll recommend the right tier for your project."
                align="center"
                className="mb-8"
              />
              <a
                href={WHATSAPP_PACKAGES_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-8 py-3.5 bg-primary text-primary-foreground border border-primary rounded-full text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors shadow-sm"
              >
                <MessageCircle className="w-4 h-4" />
                Talk to us on WhatsApp
              </a>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
