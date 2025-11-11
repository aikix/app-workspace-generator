/**
 * FadeIn component
 *
 * Simple fade-in animation wrapper
 * Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <FadeIn>
 *   <p>This content will fade in</p>
 * </FadeIn>
 * ```
 */

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotionVariants } from '../hooks';
import { fadeIn } from '../variants';

interface FadeInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * Duration of the animation in seconds
   * @default 0.3
   */
  duration?: number;
  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number;
  /**
   * Children to animate
   */
  children: React.ReactNode;
}

export function FadeIn({ children, duration = 0.3, delay = 0, ...props }: FadeInProps) {
  const variants = useReducedMotionVariants({
    ...fadeIn,
    animate: {
      ...(fadeIn.animate as object),
      transition: {
        duration,
        delay,
        ease: 'easeOut',
      },
    },
  });

  return (
    <motion.div variants={variants} initial="initial" animate="animate" exit="exit" {...props}>
      {children}
    </motion.div>
  );
}
