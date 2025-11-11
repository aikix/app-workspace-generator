/**
 * Custom hooks for animations
 *
 * Includes support for prefers-reduced-motion and scroll-triggered animations
 */

'use client';

import { useEffect, useState, useRef } from 'react';
import type { Variants } from 'framer-motion';

/**
 * Check if user prefers reduced motion
 * Respects system accessibility preferences
 *
 * @example
 * ```tsx
 * const prefersReducedMotion = usePrefersReducedMotion();
 * const variants = prefersReducedMotion ? {} : fadeIn;
 * ```
 */
export function usePrefersReducedMotion(): boolean {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handleChange = (event: MediaQueryListEvent) => {
      setPrefersReducedMotion(event.matches);
    };

    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, []);

  return prefersReducedMotion;
}

/**
 * Check if element is in viewport
 * Useful for scroll-triggered animations
 *
 * @param options - IntersectionObserver options
 * @returns [ref, isInView] - Ref to attach to element and boolean indicating if in view
 *
 * @example
 * ```tsx
 * const [ref, isInView] = useInView();
 *
 * <motion.div
 *   ref={ref}
 *   initial={{ opacity: 0 }}
 *   animate={isInView ? { opacity: 1 } : { opacity: 0 }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useInView<T extends HTMLElement>(options: IntersectionObserverInit = {}) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<T>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const observer = new IntersectionObserver(([entry]) => {
      if (entry) {
        setIsInView(entry.isIntersecting);
      }
    }, options);

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [options]);

  return [ref, isInView] as const;
}

/**
 * Create animation variants that respect prefers-reduced-motion
 * Returns empty variants if user prefers reduced motion
 *
 * @param variants - Animation variants
 * @returns Variants that respect accessibility preferences
 *
 * @example
 * ```tsx
 * const variants = useReducedMotionVariants(fadeIn);
 *
 * <motion.div variants={variants} initial="initial" animate="animate">
 *   Content
 * </motion.div>
 * ```
 */
export function useReducedMotionVariants(variants: Variants): Variants {
  const prefersReducedMotion = usePrefersReducedMotion();

  if (prefersReducedMotion) {
    // Return variants with no animation
    return {
      initial: {},
      animate: {},
      exit: {},
    };
  }

  return variants;
}

/**
 * Hook to trigger animation when element enters viewport
 * Combines useInView with animation variants
 *
 * @param variants - Animation variants
 * @param options - IntersectionObserver options
 * @returns [ref, animationVariants] - Ref to attach and variants to use
 *
 * @example
 * ```tsx
 * const [ref, variants] = useScrollAnimation(fadeIn);
 *
 * <motion.div
 *   ref={ref}
 *   variants={variants}
 *   initial="initial"
 *   animate="animate"
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useScrollAnimation<T extends HTMLElement>(
  variants: Variants,
  options: IntersectionObserverInit = {}
) {
  const [ref, isInView] = useInView<T>(options);
  const reducedMotionVariants = useReducedMotionVariants(variants);

  // Override animate state based on viewport visibility
  const scrollVariants: Variants = {
    ...reducedMotionVariants,
    animate: isInView ? reducedMotionVariants.animate : reducedMotionVariants.initial,
  };

  return [ref, scrollVariants] as const;
}

/**
 * Debounced scroll position hook
 * Useful for scroll-based animations
 *
 * @param delay - Debounce delay in milliseconds
 * @returns Current scroll position
 *
 * @example
 * ```tsx
 * const scrollY = useScrollPosition();
 * const opacity = Math.max(0, 1 - scrollY / 500);
 * ```
 */
export function useScrollPosition(delay = 100): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;

    const handleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setScrollY(window.scrollY);
      }, delay);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    setScrollY(window.scrollY); // Set initial value

    return () => {
      window.removeEventListener('scroll', handleScroll);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return scrollY;
}

/**
 * Mouse position hook
 * Useful for cursor-following animations
 *
 * @returns [x, y] - Mouse position relative to viewport
 *
 * @example
 * ```tsx
 * const [mouseX, mouseY] = useMousePosition();
 *
 * <motion.div
 *   animate={{
 *     x: mouseX / 10,
 *     y: mouseY / 10,
 *   }}
 * >
 *   Content
 * </motion.div>
 * ```
 */
export function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setPosition({
        x: event.clientX,
        y: event.clientY,
      });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return [position.x, position.y] as const;
}
