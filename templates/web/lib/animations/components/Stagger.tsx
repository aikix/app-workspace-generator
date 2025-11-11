/**
 * Stagger component
 *
 * Animates children with a staggered delay
 * Respects prefers-reduced-motion
 *
 * @example
 * ```tsx
 * <Stagger>
 *   <div>Item 1</div>
 *   <div>Item 2</div>
 *   <div>Item 3</div>
 * </Stagger>
 * ```
 */

'use client';

import { motion, type HTMLMotionProps } from 'framer-motion';
import { useReducedMotionVariants } from '../hooks';
import { staggerContainer, staggerItem } from '../variants';

interface StaggerProps extends Omit<HTMLMotionProps<'div'>, 'variants'> {
  /**
   * Delay between each child animation in seconds
   * @default 0.1
   */
  staggerDelay?: number;
  /**
   * Initial delay before animations start in seconds
   * @default 0.1
   */
  delayChildren?: number;
  /**
   * Children to animate
   */
  children: React.ReactNode;
}

export function Stagger({ children, staggerDelay = 0.1, delayChildren = 0.1, ...props }: StaggerProps) {
  const containerVariants = useReducedMotionVariants({
    ...staggerContainer,
    animate: {
      ...(staggerContainer.animate as object),
      transition: {
        staggerChildren: staggerDelay,
        delayChildren,
      },
    },
  });

  const itemVariants = useReducedMotionVariants(staggerItem);

  return (
    <motion.div variants={containerVariants} initial="initial" animate="animate" exit="exit" {...props}>
      {Array.isArray(children)
        ? children.map((child, index) => (
            <motion.div key={index} variants={itemVariants}>
              {child}
            </motion.div>
          ))
        : children}
    </motion.div>
  );
}
