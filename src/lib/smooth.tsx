import { useEffect, useRef, type ReactNode } from 'react';
import { ReactLenis, type LenisRef } from 'lenis/react';
import 'lenis/dist/lenis.css';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

/** True when the OS asks for no animation — we honor it everywhere. */
export function prefersReducedMotion(): boolean {
  return (
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

/**
 * Root smooth-scroll provider (2026 stack: Lenis driven on GSAP's ticker,
 * single RAF loop so ScrollTrigger never lags a frame behind the eased scroll).
 * With reduced motion: plain native scroll, no easing, no triggers.
 */
export function SmoothRoot({ children }: { children: ReactNode }) {
  const lenisRef = useRef<LenisRef>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return;
    function update(time: number) {
      lenisRef.current?.lenis?.raf(time * 1000);
    }
    gsap.ticker.add(update);
    gsap.ticker.lagSmoothing(0);
    const refresh = () => ScrollTrigger.refresh();
    if (document.fonts?.ready) {
      void document.fonts.ready.then(refresh);
    } else {
      window.setTimeout(refresh, 800);
    }
    return () => {
      gsap.ticker.remove(update);
    };
  }, []);

  if (prefersReducedMotion()) return <>{children}</>;

  return (
    <ReactLenis root ref={lenisRef} options={{ autoRaf: false, lerp: 0.1, syncTouch: false }}>
      {children}
    </ReactLenis>
  );
}
