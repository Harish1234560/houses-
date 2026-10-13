'use client';

import { cn } from '@/lib/utils';

export function SectionHeading({
  eyebrow,
  title,
  description,
  className,
  align = 'left',
}: {
  eyebrow?: string;
  title: React.ReactNode;
  description?: string;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div
      className={cn(
        'flex flex-col gap-4',
        align === 'center' && 'items-center text-center',
        className
      )}
    >
      {eyebrow && (
        <span className="section-number">{eyebrow}</span>
      )}
      <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-foreground leading-tight max-w-3xl">
        {title}
      </h2>
      {description && (
        <p className="text-muted-foreground text-base lg:text-lg leading-relaxed max-w-2xl">
          {description}
        </p>
      )}
    </div>
  );
}
