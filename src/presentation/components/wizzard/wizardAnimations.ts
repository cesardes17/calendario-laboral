/**
 * Wizard Animation Constants
 *
 * Defines reusable animation variants and transitions for wizard components
 */

/**
 * Slide animation variants for wizard transitions
 * Slides content in from right (next) or left (previous)
 */
export const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 300 : -300,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -300 : 300,
    opacity: 0,
  }),
};

/**
 * Spring transition configuration for smooth animations
 */
export const springTransition = {
  x: { type: "spring" as const, stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

/**
 * Progress bar animation configuration
 */
export const progressBarTransition = {
  duration: 0.3,
  ease: "easeInOut" as const,
};
