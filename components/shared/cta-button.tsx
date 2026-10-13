'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function CTAButton({
  href,
  children,
  variant = 'primary',
  className,
  external = false,
}: {
  href: string;
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost';
  className?: string;
  external?: boolean;
}) {
  const base = 'inline-flex items-center gap-2.5 px-7 py-3 text-sm font-medium tracking-wide-sm rounded-full border transition-all duration-500 ease-editorial group relative overflow-hidden shadow-sm';
  const variants = {
    primary: 'bg-primary text-primary-foreground border-primary shimmer-btn hover:bg-primary/90 hover:border-primary/90 hover:shadow-lg hover:shadow-primary/20',
    outline: 'border-primary/40 text-foreground bg-card hover:border-primary/60 hover:text-primary hover:bg-card/90 shadow-md',
    ghost: 'border-border/40 text-foreground hover:border-primary/60 hover:text-primary hover:bg-card/40',
  };

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(base, variants[variant], className)}
      >
        {children}
        <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
      </a>
    );
  }

  return (
    <Link href={href} className={cn(base, variants[variant], className)}>
      {children}
      <ArrowRight className="w-4 h-4 transition-transform duration-500 group-hover:translate-x-1.5" />
    </Link>
  );
}
