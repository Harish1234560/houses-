import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy policy for Golden Axis Ventures.',
};

export default function PrivacyPage() {
  return (
    <div className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="font-serif text-4xl lg:text-5xl text-foreground mb-8">Privacy Policy</h1>
        <div className="prose prose-invert max-w-none">
          <div className="space-y-6 text-muted-foreground leading-relaxed">
            <p>
              {COMPANY.name} (&quot;we&quot;, &quot;us&quot;) respects your privacy and is committed to protecting your personal data. This policy explains how we collect, use and safeguard information you provide through this website.
            </p>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Information we collect</h2>
              <p>
                When you submit an enquiry form, we collect your name, phone number, email address (if provided), project location, service requirements, estimated budget (if provided) and your message. We also collect basic technical information such as browser type for security purposes.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">How we use your information</h2>
              <p>
                We use the information you provide to respond to your enquiry, provide information about our services, and communicate with you about your project. We do not sell or share your personal data with third parties for marketing purposes.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Data storage and security</h2>
              <p>
                Your enquiry data is stored securely and is accessible only to authorised personnel within {COMPANY.name}. We employ appropriate technical and organisational measures to protect your personal information.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Your rights</h2>
              <p>
                You may request access to, correction of, or deletion of your personal data by contacting us at {COMPANY.email}.
              </p>
            </div>

            <div>
              <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Contact</h2>
              <p>
                For any questions about this privacy policy, please contact us at {COMPANY.email} or {COMPANY.phone}.
              </p>
            </div>

            <p className="text-sm text-muted-foreground/60 pt-8 border-t border-border/30">
              This privacy policy is provided as a general framework. Please have it reviewed by a qualified legal professional before relying on it for compliance purposes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
