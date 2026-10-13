import type { Metadata } from 'next';
import { COMPANY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: 'Terms of use for Golden Axis Ventures.',
};

export default function TermsPage() {
  return (
    <div className="pt-32 pb-16 lg:pt-40 lg:pb-24 bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        <h1 className="font-serif text-4xl lg:text-5xl text-foreground mb-8">Terms of Use</h1>
        <div className="space-y-6 text-muted-foreground leading-relaxed">
          <p>
            These terms govern your use of the {COMPANY.name} website. By accessing this website, you agree to these terms.
          </p>

          <div>
            <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Use of content</h2>
            <p>
              All content on this website, including text, images, logos and design elements, is the property of {COMPANY.name} or its licensors. You may not reproduce, distribute or use any content without prior written permission.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Project information</h2>
            <p>
              Information about projects, properties and marketing packages is provided for general informational purposes only. Availability, pricing and specifications may change. Please contact us to confirm current details before making any decisions.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">No warranty</h2>
            <p>
              This website is provided &quot;as is&quot; without warranties of any kind. {COMPANY.name} does not guarantee the accuracy, completeness or timeliness of all information presented.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Enquiries</h2>
            <p>
              When you submit an enquiry, you consent to being contacted by {COMPANY.name} regarding your enquiry. You are responsible for providing accurate contact information.
            </p>
          </div>

          <div>
            <h2 className="font-serif text-2xl text-foreground mb-3 mt-8">Contact</h2>
            <p>
              For questions about these terms, please contact us at {COMPANY.email}.
            </p>
          </div>

          <p className="text-sm text-muted-foreground/60 pt-8 border-t border-border/30">
            These terms are provided as a general framework. Please have them reviewed by a qualified legal professional before relying on them for compliance purposes.
          </p>
        </div>
      </div>
    </div>
  );
}
