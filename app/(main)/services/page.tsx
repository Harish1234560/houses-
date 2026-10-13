import type { Metadata } from 'next';
import Image from 'next/image';
import { COMPANY, WHATSAPP_LINK } from '@/lib/constants';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';
import { CTAButton } from '@/components/shared/cta-button';

export const metadata: Metadata = {
  title: 'Services — Golden Axis Ventures',
  description: 'Project marketing, real estate sales, digital marketing and sales management — a complete real estate marketing and sales operation.',
};

const SERVICE_IMAGES = [
  'https://images.pexels.com/photos/6476192/pexels-photo-6476192.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/6476187/pexels-photo-6476187.jpeg?auto=compress&cs=tinysrgb&w=1200',
  'https://images.pexels.com/photos/8815909/pexels-photo-8815909.jpeg?auto=compress&cs=tinysrgb&w=1200',
];

export default function ServicesPage() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">Services</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              A complete real estate marketing <span className="text-primary italic">and sales operation</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Four connected departments carry a project from first campaign to final booking.
            </p>
          </Reveal>
        </div>
      </section>

      {COMPANY.serviceDetails.map((service, i) => (
        <section
          key={service.number}
          className={i % 2 === 0 ? 'py-24 lg:py-32 bg-background' : 'py-24 lg:py-32 bg-card/50 border-y border-border/30'}
        >
          <div className="container mx-auto px-4 sm:px-6 lg:px-8">
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center ${i % 2 !== 0 ? 'lg:[direction:rtl]' : ''}`}>
              <Reveal className="[direction:ltr]">
                <div className="relative image-zoom-container rounded-2xl overflow-hidden border border-border aspect-[4/3] hover-lift shadow-sm">
                  <Image
                    src={SERVICE_IMAGES[i] || SERVICE_IMAGES[0]}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                  <div className="absolute top-6 left-6 font-serif text-5xl text-foreground/80 leading-none drop-shadow-lg">
                    {service.number}
                  </div>
                </div>
              </Reveal>
              <Reveal className="[direction:ltr]" stagger>
                <span className="section-number">{service.number}</span>
                <h2 className="font-serif text-3xl lg:text-5xl text-foreground mt-4 mb-6 leading-tight">
                  {service.title}
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed mb-8">{service.description}</p>
                <div className="grid grid-cols-2 gap-4">
                  {service.features.map((feat) => (
                    <div key={feat} className="flex items-center gap-3 text-sm text-foreground/80 group">
                      <span className="w-2 h-2 border border-primary/50 rounded-sm transition-all group-hover:bg-primary/50" />
                      {feat}
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      ))}

      <section className="relative py-24 lg:py-32 overflow-hidden bg-card/50 grain-overlay border-y border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal>
            <SectionHeading
              eyebrow="Tailored approach"
              title={<>Need a tailored <span className="text-primary italic">marketing plan</span>?</>}
              description="Send us a few details and we'll recommend the right approach for your project."
              align="center"
              className="mb-10"
            />
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <CTAButton href="/packages" variant="primary">
                View marketing packages
              </CTAButton>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2.5 px-7 py-3 border border-border text-foreground rounded-full text-sm font-medium hover:border-primary/60 hover:text-primary transition-colors group bg-card/60 shadow-sm"
              >
                Talk on WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
