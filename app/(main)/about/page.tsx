import type { Metadata } from 'next';
import Image from 'next/image';
import { COMPANY } from '@/lib/constants';
import { SectionHeading } from '@/components/shared/section-heading';
import { Reveal } from '@/components/shared/reveal';
import { CTAButton } from '@/components/shared/cta-button';
import { WHATSAPP_LINK } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'About — Golden Axis Ventures',
  description: 'A Mysuru-based real estate marketing and sales organisation built on integrity, transparency, commitment, excellence and innovation.',
};

const ABOUT_IMAGE = 'https://images.pexels.com/photos/6476255/pexels-photo-6476255.jpeg?auto=compress&cs=tinysrgb&w=1200';
const TEAM_IMAGE = 'https://images.pexels.com/photos/6476185/pexels-photo-6476185.jpeg?auto=compress&cs=tinysrgb&w=1200';

export default function AboutPage() {
  return (
    <>
      <section className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">About us</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              Marketing real estate with <span className="text-primary italic">trust, transparency</span> and results
            </h1>
          </Reveal>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-20 items-start">
            <Reveal className="lg:col-span-5">
              <div className="image-zoom-container rounded-sm overflow-hidden border border-border/20">
                <Image
                  src={ABOUT_IMAGE}
                  alt="Golden Axis Ventures team — real estate marketing professionals"
                  width={1200}
                  height={1500}
                  className="w-full h-auto"
                />
              </div>
            </Reveal>
            <Reveal className="lg:col-span-7" stagger>
              <SectionHeading
                eyebrow="Our story"
                title="Built on a foundation of trust"
                className="mb-8"
              />
              <div className="space-y-6 text-muted-foreground leading-relaxed">
                <p>
                  Golden Axis Ventures is a Mysuru-based real estate marketing and sales organisation. We connect developers, investors and homebuyers through trust, transparency and results — with a growing footprint across South India.
                </p>
                <p>
                  Our approach is built on taking exclusive project mandates, which lets us build a dedicated campaign around one project rather than splitting attention across many. CRM management, digital advertising, lead tracking systems and analytics-based decisions run behind every campaign.
                </p>
                <p>
                  A trained sales force focuses on lead conversion, site visits, customer engagement and closing bookings — not just generating enquiries. With a close, working understanding of Mysuru, Bengaluru, Mandya, Hassan and the growth corridors emerging around them, we bring genuine local market expertise to every project we take on.
                </p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-card/50 border-y border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <SectionHeading
              eyebrow="Core values"
              title={<>What guides <span className="text-primary italic">how we work</span></>}
              className="mb-16"
            />
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {COMPANY.values.map((value) => (
              <Reveal key={value.title}>
                <div className="border border-border bg-card p-6 rounded-xl hover:border-primary/50 transition-colors h-full shadow-sm">
                  <h3 className="font-serif text-xl text-primary mb-3">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{value.description}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 lg:py-32 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <Reveal>
              <span className="section-number">Operating approach</span>
              <h2 className="font-serif text-3xl lg:text-5xl text-foreground mt-4 mb-6 leading-tight">
                Exclusive mandates, technology-driven execution
              </h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <p>We take on exclusive project mandates, building a dedicated campaign around one project rather than splitting attention across many.</p>
                <p>CRM management, digital advertising, lead tracking systems and analytics-based decisions run behind every campaign, supported by a trained professional sales force.</p>
              </div>
              <div className="mt-8">
                <CTAButton href="/contact" variant="primary">
                  Work with us
                </CTAButton>
              </div>
            </Reveal>
            <Reveal>
              <div className="image-zoom-container rounded-sm overflow-hidden border border-border/20">
                <Image
                  src={TEAM_IMAGE}
                  alt="Golden Axis Ventures — professional sales and marketing team"
                  width={1200}
                  height={800}
                  className="w-full h-auto"
                />
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative py-24 lg:py-32 overflow-hidden bg-card/50 grain-overlay border-y border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <Reveal>
            <h2 className="font-serif text-3xl lg:text-5xl text-foreground leading-tight mb-6">
              Ready to discuss your project?
            </h2>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
              <CTAButton href="/contact" variant="primary">
                Get in touch
              </CTAButton>
              <a
                href={WHATSAPP_LINK}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 border border-border text-foreground rounded-sm text-sm font-medium hover:border-primary/60 hover:text-primary transition-colors"
              >
                WhatsApp us
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
