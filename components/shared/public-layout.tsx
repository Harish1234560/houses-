'use client';

import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Navbar } from '@/components/shared/navbar';
import { Footer } from '@/components/shared/footer';
import { FloatingWhatsApp } from '@/components/shared/floating-whatsapp';
import { useScrollProgress } from '@/hooks/use-scroll-progress';

const ArchitecturalSceneLazy = dynamic(
  () => import('@/components/three/architectural-scene').then((m) => m.ArchitecturalSceneLazy),
  { ssr: false, loading: () => null }
);

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const scrollProgress = useScrollProgress();
  const pathname = usePathname();
  const isHome = pathname === '/';

  return (
    <>
      <Navbar />
      {isHome && (
        <div
          className="pointer-events-none fixed inset-y-0 right-0 z-0 w-full lg:w-1/2"
          id="scene-canvas-wrapper"
          aria-hidden="true"
          style={{ opacity: 0.12, transition: 'opacity 1s ease' }}
        >
          <ArchitecturalSceneLazy scrollProgress={scrollProgress} />
        </div>
      )}
      <main className="min-h-screen relative z-10">{children}</main>
      <Footer />
      <FloatingWhatsApp />
    </>
  );
}
