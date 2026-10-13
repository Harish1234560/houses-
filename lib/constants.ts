export const COMPANY = {
  name: 'Golden Axis Ventures',
  tagline: 'Your property. Our marketing power.',
  phone: '+91 77606 49855',
  phoneRaw: '917760649855',
  email: 'goldenaxisventures@gmail.com',
  address: 'Damden City Square, Bannimantap, Mysuru, Karnataka, India',
  city: 'Mysuru',
  state: 'Karnataka',
  country: 'India',
  website: 'https://goldenaxisventures.in',
  description:
    'Golden Axis Ventures is a Mysuru-based real estate marketing and sales organisation, connecting developers, investors and homebuyers through trust, transparency and results — with a growing footprint across South India.',
  services: [
    'Project Marketing',
    'Real Estate Sales',
    'Digital Marketing',
    'Sales Management',
  ],
  values: [
    { title: 'Integrity', description: 'Conducting business ethically and responsibly.' },
    { title: 'Transparency', description: 'Clear communication and honest dealings.' },
    { title: 'Commitment', description: 'Dedicated focus on achieving client objectives.' },
    { title: 'Excellence', description: 'Continuous improvement in service delivery.' },
    { title: 'Innovation', description: 'Adopting modern marketing techniques and technology.' },
  ],
  markets: [
    { city: 'Mysuru', label: 'Home base' },
    { city: 'Bengaluru', label: 'Core market' },
    { city: 'Mandya', label: 'Core market' },
    { city: 'Hassan', label: 'Core market' },
    { city: '& beyond', label: 'Emerging corridors' },
  ],
  growthPlan: [
    {
      phase: 'Phase 1',
      title: 'Mysuru market leadership',
      description: 'Become one of the most recognised real estate marketing firms in Mysuru.',
    },
    {
      phase: 'Phase 2',
      title: 'Karnataka expansion',
      description: "Extending coverage across the state's key markets.",
      cities: ['Bengaluru', 'Mysuru', 'Mangaluru', 'Hubballi'],
    },
    {
      phase: 'Phase 3',
      title: 'South India expansion',
      description: 'Carrying the same model into neighbouring metro markets.',
      cities: ['Hyderabad', 'Chennai', 'Kochi'],
    },
    {
      phase: 'Phase 4',
      title: 'National presence',
      description: 'Establishing Golden Axis Ventures as a trusted real estate sales and marketing brand across India.',
    },
  ],
  differentiators: [
    {
      number: '01',
      label: 'Exclusive mandates',
      title: 'Exclusive marketing strategy',
      description:
        'We take on exclusive project mandates, which lets us build a dedicated campaign around one project rather than splitting attention across many.',
    },
    {
      number: '02',
      label: 'Technology',
      title: 'Technology-driven',
      description:
        'CRM management, digital advertising, lead tracking systems and analytics-based decisions run behind every campaign.',
    },
    {
      number: '03',
      label: 'Local knowledge',
      title: 'Local market expertise',
      description:
        'A close, working understanding of Mysuru, Bengaluru, Mandya, Hassan and the growth corridors emerging around them.',
    },
    {
      number: '04',
      label: 'People',
      title: 'Professional sales force',
      description:
        'A trained team focused on lead conversion, site visits, customer engagement and closing bookings — not just generating enquiries.',
    },
  ],
  serviceDetails: [
    {
      number: '01',
      title: 'Project Marketing',
      description:
        'Branding, campaign planning and launch strategy built around each project\'s own identity, backed by consistent advertising and hands-on sales execution.',
      features: ['Branding', 'Campaign planning', 'Launch strategy', 'Advertising', 'Sales execution'],
    },
    {
      number: '02',
      title: 'Real Estate Sales',
      description:
        'Direct sales coverage across residential sites, premium plots, farmland, commercial sites and investment properties.',
      features: ['Residential sites', 'Premium plots', 'Farm lands', 'Commercial sites', 'Investment properties'],
    },
    {
      number: '03',
      title: 'Digital Marketing',
      description:
        'Meta, Google and YouTube campaigns paired with WhatsApp and email outreach, so every lead is captured and followed through.',
      features: ['Facebook & Instagram', 'Google Ads', 'YouTube', 'WhatsApp campaigns', 'Email marketing'],
    },
    {
      number: '04',
      title: 'Sales Management',
      description:
        'A trained sales force handles deployment, lead management, follow-up, booking and revenue tracking end to end.',
      features: ['Sales deployment', 'Lead management', 'Customer follow-up', 'Booking management', 'Revenue tracking'],
    },
  ],
  capabilities: [
    'Exclusive project marketing',
    'Residential plot sales',
    'Project launch strategy',
    'Digital lead generation',
    'Sales team management',
    'Real estate consulting',
  ],
};

export const NAV_LINKS = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About' },
  { href: '/services', label: 'Services' },
  { href: '/projects', label: 'Projects' },
  { href: '/campaigns', label: 'Campaigns' },
  { href: '/packages', label: 'Packages' },
  { href: '/contact', label: 'Contact' },
];

export const WHATSAPP_LINK = `https://wa.me/${COMPANY.phoneRaw}?text=Hi%20Golden%20Axis%20Ventures%2C%20I'd%20like%20to%20know%20more%20about%20your%20real%20estate%20marketing%20services.`;

export const WHATSAPP_PACKAGES_LINK = `https://wa.me/${COMPANY.phoneRaw}?text=Hi%20Golden%20Axis%20Ventures%2C%20I'd%20like%20help%20choosing%20the%20right%20marketing%20package%20for%20my%20project.`;
