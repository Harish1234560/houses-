'use client';

import { useState } from 'react';
import { Phone, Mail, MapPin, MessageCircle, Send, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';
import { COMPANY, WHATSAPP_LINK } from '@/lib/constants';
import { Reveal } from '@/components/shared/reveal';
import { useSupabase } from '@/components/providers/supabase-provider';

const ENQUIRY_TYPES = ['Developer', 'Investor', 'Homebuyer'];
const SERVICES = [
  'Project Marketing',
  'Real Estate Sales',
  'Digital Marketing',
  'Sales Management',
  'Consulting',
];

export default function ContactPage() {
  const { supabase } = useSupabase();
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    enquiry_type: 'Developer',
    project_location: '',
    service_required: 'Project Marketing',
    estimated_budget: '',
    message: '',
    consent: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.consent) {
      toast.error('Please accept the privacy consent to submit.');
      return;
    }
    if (!supabase) {
      toast.error('Unable to connect. Please try again.');
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.from('enquiries').insert({
      name: form.name,
      phone: form.phone,
      email: form.email || null,
      enquiry_type: form.enquiry_type,
      project_location: form.project_location || null,
      service_required: form.service_required,
      estimated_budget: form.estimated_budget || null,
      message: form.message,
    });

    setSubmitting(false);

    if (error) {
      toast.error('Something went wrong. Please try again or call us directly.');
      return;
    }

    setSubmitted(true);
    toast.success('Your enquiry has been submitted. We will be in touch soon.');
    setForm({
      name: '',
      phone: '',
      email: '',
      enquiry_type: 'Developer',
      project_location: '',
      service_required: 'Project Marketing',
      estimated_budget: '',
      message: '',
      consent: false,
    });
  };

  const handleChange = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const inputClass =
    'w-full px-4 py-3 bg-card border border-border rounded-md text-sm text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:outline-none transition-colors shadow-sm';

  return (
    <>
      <section className="pt-32 pb-12 lg:pt-40 lg:pb-16 bg-card/50 grain-overlay border-b border-border/30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <span className="section-number">Contact</span>
            <h1 className="font-serif text-4xl lg:text-6xl text-foreground mt-4 leading-tight max-w-4xl">
              Let&apos;s start a <span className="text-primary italic">conversation</span>
            </h1>
            <p className="mt-6 text-muted-foreground text-lg max-w-2xl leading-relaxed">
              Tell us about your project, and we&apos;ll get back to you with a plan.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="py-16 lg:py-24 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
            <Reveal className="lg:col-span-5">
              <h2 className="font-serif text-2xl text-foreground mb-6">Get in touch</h2>
              <div className="space-y-6">
                <a href={`tel:${COMPANY.phoneRaw}`} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-sm">
                    <Phone className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <div className="text-xs tracking-editorial uppercase text-muted-foreground mb-1">Phone</div>
                    <div className="text-foreground text-sm">{COMPANY.phone}</div>
                  </div>
                </a>
                <a href={`mailto:${COMPANY.email}`} className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center shrink-0 group-hover:border-primary/40 transition-colors shadow-sm">
                    <Mail className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <div className="text-xs tracking-editorial uppercase text-muted-foreground mb-1">Email</div>
                    <div className="text-foreground text-sm">{COMPANY.email}</div>
                  </div>
                </a>
                <div className="flex items-start gap-4">
                  <div className="w-11 h-11 rounded-md border border-border bg-card flex items-center justify-center shrink-0 shadow-sm">
                    <MapPin className="w-5 h-5 text-primary/70" />
                  </div>
                  <div>
                    <div className="text-xs tracking-editorial uppercase text-muted-foreground mb-1">Location</div>
                    <div className="text-foreground text-sm">{COMPANY.address}</div>
                  </div>
                </div>
                <a
                  href={WHATSAPP_LINK}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-7 py-3 bg-primary text-primary-foreground border border-primary rounded-full text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors w-fit shadow-sm"
                >
                  <MessageCircle className="w-4 h-4" />
                  Message on WhatsApp
                </a>
              </div>
            </Reveal>

            <Reveal className="lg:col-span-7">
              {submitted ? (
                <div className="border border-primary/40 bg-card rounded-2xl p-12 text-center shadow-sm">
                  <CheckCircle2 className="w-12 h-12 text-primary mx-auto mb-4" />
                  <h3 className="font-serif text-2xl text-foreground mb-3">Enquiry submitted</h3>
                  <p className="text-muted-foreground mb-6">
                    Thank you for reaching out. Our team will get back to you shortly.
                  </p>
                  <button
                    onClick={() => setSubmitted(false)}
                    className="text-sm text-primary hover:text-primary/80 transition-colors px-6 py-2.5 border border-primary/40 rounded-full"
                  >
                    Submit another enquiry
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => handleChange('name', e.target.value)}
                        className={inputClass}
                        placeholder="Your full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Phone *
                      </label>
                      <input
                        type="tel"
                        required
                        value={form.phone}
                        onChange={(e) => handleChange('phone', e.target.value)}
                        className={inputClass}
                        placeholder="+91 00000 00000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => handleChange('email', e.target.value)}
                      className={inputClass}
                      placeholder="you@example.com"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Enquiry type *
                      </label>
                      <select
                        value={form.enquiry_type}
                        onChange={(e) => handleChange('enquiry_type', e.target.value)}
                        className={inputClass}
                      >
                        {ENQUIRY_TYPES.map((t) => (
                          <option key={t} value={t}>{t}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Service required *
                      </label>
                      <select
                        value={form.service_required}
                        onChange={(e) => handleChange('service_required', e.target.value)}
                        className={inputClass}
                      >
                        {SERVICES.map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Project location
                      </label>
                      <input
                        type="text"
                        value={form.project_location}
                        onChange={(e) => handleChange('project_location', e.target.value)}
                        className={inputClass}
                        placeholder="City or area"
                      />
                    </div>
                    <div>
                      <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                        Estimated budget
                      </label>
                      <input
                        type="text"
                        value={form.estimated_budget}
                        onChange={(e) => handleChange('estimated_budget', e.target.value)}
                        className={inputClass}
                        placeholder="Optional"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs tracking-wide-sm uppercase text-muted-foreground mb-2">
                      Message *
                    </label>
                    <textarea
                      required
                      rows={4}
                      value={form.message}
                      onChange={(e) => handleChange('message', e.target.value)}
                      className={inputClass}
                      placeholder="Tell us about your project..."
                    />
                  </div>

                  <label className="flex items-start gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.consent}
                      onChange={(e) => handleChange('consent', e.target.checked)}
                      className="mt-1 w-4 h-4 accent-primary"
                    />
                    <span className="text-xs text-muted-foreground leading-relaxed">
                      I agree that Golden Axis Ventures may contact me regarding my enquiry, in accordance with the privacy policy.
                    </span>
                  </label>

                  <button
                    type="submit"
                    disabled={submitting}
                    className="inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-primary-foreground border border-primary rounded-full text-sm font-medium shimmer-btn hover:bg-primary/90 transition-colors disabled:opacity-50 shadow-sm"
                  >
                    {submitting ? (
                      'Submitting...'
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Submit enquiry
                      </>
                    )}
                  </button>
                </form>
              )}
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
