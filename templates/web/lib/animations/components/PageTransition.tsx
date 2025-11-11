/**
 * PageTransition component
 *
 * Wraps page content with AnimatePresence for smooth page transitions
 * Respects prefers-reduced-motion
 *
 * @example In layout.tsx or page.tsx:
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 */

'use client';

import { motion, AnimatePresence, type HTMLMotionProps } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { useReducedMotionVariants } from '../hooks';
import { pageTransition } from '../variants';

interface PageTransitionProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * Children to animate
   */
  children: React.ReactNode;
  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number;
}

export function PageTransition({ children, duration = 0.4, ...props }: PageTransitionProps) {
  const pathname = usePathname();

  const variants = useReducedMotionVariants({
    ...pageTransition,
    animate: {
      ...(pageTransition.animate as object),
      transition: {
        duration,
        ease: 'easeInOut',
      },
    },
    exit: {
      ...(pageTransition.exit as object),
      transition: {
        duration,
        ease: 'easeInOut',
      },
    },
  });

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        variants={variants}
        initial="initial"
        animate="animate"
        exit="exit"
        {...props}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
