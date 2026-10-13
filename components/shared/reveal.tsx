'use client';

import { useRef, type ReactNode } from 'react';
import { useScrollReveal } from '@/hooks/use-scroll-reveal';
import { cn } from '@/lib/utils';

export function Reveal({
  children,
  className,
  stagger = false,
  as: Tag = 'div',
}: {
  children: ReactNode;
  className?: string;
  stagger?: boolean;
  as?: 'div' | 'section' | 'article' | 'li' | 'span';
}) {
  const { ref, revealed } = useScrollReveal<HTMLDivElement>();
  return (
    <Tag
      ref={ref as React.RefObject<any>}
      className={cn(stagger ? 'reveal-stagger' : 'reveal', revealed && 'revealed', className)}
    >
      {children}
    </Tag>
  );
}
