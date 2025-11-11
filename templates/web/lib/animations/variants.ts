/**
 * Reusable animation variants for Framer Motion
 *
 * @example
 * ```tsx
 * import { motion } from 'framer-motion';
 * import { fadeIn } from '@/lib/animations/variants';
 *
 * <motion.div {...fadeIn}>
 *   Content
 * </motion.div>
 * ```
 */

import type { Variants } from 'framer-motion';

/**
 * Fade in animation
 */
export const fadeIn: Variants = {
  initial: {
    opacity: 0,
  },
  animate: {
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide up animation
 */
export const slideUp: Variants = {
  initial: {
    y: 20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    y: -20,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide down animation
 */
export const slideDown: Variants = {
  initial: {
    y: -20,
    opacity: 0,
  },
  animate: {
    y: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    y: 20,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide in from left
 */
export const slideInLeft: Variants = {
  initial: {
    x: -50,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    x: 50,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Slide in from right
 */
export const slideInRight: Variants = {
  initial: {
    x: 50,
    opacity: 0,
  },
  animate: {
    x: 0,
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    x: -50,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Scale in animation
 */
export const scaleIn: Variants = {
  initial: {
    scale: 0.9,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      duration: 0.3,
      ease: 'easeOut',
    },
  },
  exit: {
    scale: 0.9,
    opacity: 0,
    transition: {
      duration: 0.2,
      ease: 'easeIn',
    },
  },
};

/**
 * Bounce in animation
 */
export const bounceIn: Variants = {
  initial: {
    scale: 0.3,
    opacity: 0,
  },
  animate: {
    scale: 1,
    opacity: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
  exit: {
    scale: 0.5,
    opacity: 0,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Stagger children animation container
 */
export const staggerContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1,
    },
  },
};

/**
 * Stagger child animation
 */
export const staggerItem: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: 0.2,
    },
  },
};

/**
 * Page transition (slide and fade)
 */
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    x: -20,
  },
  animate: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
  exit: {
    opacity: 0,
    x: 20,
    transition: {
      duration: 0.4,
      ease: 'easeInOut',
    },
  },
};

/**
 * Rotate in animation
 */
export const rotateIn: Variants = {
  initial: {
    rotate: -10,
    opacity: 0,
  },
  animate: {
    rotate: 0,
    opacity: 1,
    transition: {
      duration: 0.5,
      ease: 'easeOut',
    },
  },
  exit: {
    rotate: 10,
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};

/**
 * Blur in animation
 */
export const blurIn: Variants = {
  initial: {
    filter: 'blur(10px)',
    opacity: 0,
  },
  animate: {
    filter: 'blur(0px)',
    opacity: 1,
    transition: {
      duration: 0.4,
      ease: 'easeOut',
    },
  },
  exit: {
    filter: 'blur(10px)',
    opacity: 0,
    transition: {
      duration: 0.3,
      ease: 'easeIn',
    },
  },
};
