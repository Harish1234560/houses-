'use client';

import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export function useScrollProgress() {
  const scrollProgress = useRef(0);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const hero = document.querySelector('#home-hero');
    const projects = document.querySelector('#home-projects');
    const trigger = gsap.to(scrollProgress, {
      current: 1,
      ease: 'none',
      scrollTrigger: {
        trigger: hero || document.documentElement,
        start: 'top top',
        endTrigger: projects || document.documentElement,
        end: projects ? 'top center' : 'bottom bottom',
        scrub: 0.8,
        invalidateOnRefresh: true,
      },
    });

    return () => {
      trigger.scrollTrigger?.kill();
      trigger.kill();
    };
  }, []);

  return scrollProgress;
}
