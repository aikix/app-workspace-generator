/**
 * SlideIn component
 *
 * Slide and fade animation wrapper with configurable direction
 * Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <SlideIn direction="up">
 *   <p>This content will slide up</p>
 * </SlideIn>
 * ```
 */

'use client';

import { motion, type HTMLMotionProps, type Variants } from 'framer-motion';
import { useReducedMotionVariants } from '../hooks';
import { slideUp, slideDown, slideInLeft, slideInRight } from '../variants';

type Direction = 'up' | 'down' | 'left' | 'right';

interface SlideInProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * Direction to slide from
   * @default 'up'
   */
  direction?: Direction;
  /**
   * Duration of the animation in seconds
   * @default 0.4
   */
  duration?: number;
  /**
   * Delay before animation starts in seconds
   * @default 0
   */
  delay?: number;
  /**
   * Distance to slide in pixels
   * @default 20 for up/down, 50 for left/right
   */
  distance?: number;
  /**
   * Children to animate
   */
  children: React.ReactNode;
}

const directionVariants: Record<Direction, Variants> = {
  up: slideUp,
  down: slideDown,
  left: slideInLeft,
  right: slideInRight,
};

export function SlideIn({
  children,
  direction = 'up',
  duration = 0.4,
  delay = 0,
  distance,
  ...props
}: SlideInProps) {
  const baseVariants = directionVariants[direction];

  // Customize distance if provided
  const customVariants: Variants = distance
    ? {
        ...baseVariants,
        initial: {
          ...(baseVariants.initial as object),
          ...(direction === 'up' || direction === 'down' ? { y: direction === 'up' ? distance : -distance } : {}),
          ...(direction === 'left' || direction === 'right' ? { x: direction === 'left' ? -distance : distance } : {}),
        },
      }
    : baseVariants;

  const variants = useReducedMotionVariants({
    ...customVariants,
    animate: {
      ...(customVariants.animate as object),
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
