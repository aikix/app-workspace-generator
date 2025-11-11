/**
 * ScrollReveal component
 *
 * Animates content when it enters the viewport
 * Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <ScrollReveal>
 *   <p>This content will animate when scrolled into view</p>
 * </ScrollReveal>
 * ```
 */

'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { useScrollAnimation } from '../hooks';
import { fadeIn } from '../variants';

interface ScrollRevealProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * Animation variants to use
   * @default fadeIn
   */
  variants?: Variants;
  /**
   * Threshold for triggering animation (0-1)
   * @default 0.1
   */
  threshold?: number;
  /**
   * Only animate once (don't re-animate when scrolling back)
   * @default true
   */
  once?: boolean;
  /**
   * Children to animate
   */
  children: React.ReactNode;
}

export function ScrollReveal({
  children,
  variants = fadeIn,
  threshold = 0.1,
  once = true,
  ...props
}: ScrollRevealProps) {
  const [ref, scrollVariants] = useScrollAnimation(variants, {
    threshold,
    triggerOnce: once,
  });

  return (
    <motion.div ref={ref} variants={scrollVariants} initial="initial" animate="animate" {...props}>
      {children}
    </motion.div>
  );
}
