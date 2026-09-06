"use client";

/**
 * Shared Framer Motion primitives.
 *
 * Everything here is deliberately restrained — short distances, long easings.
 * The house easing is a soft "expo out" so movement decelerates rather than
 * bouncing, which is what makes it read as expensive rather than flashy.
 *
 * All of it degrades to an instant, motionless render when the visitor has
 * asked for reduced motion.
 */

import {
  motion,
  useReducedMotion,
  type HTMLMotionProps,
  type Variants,
} from "framer-motion";
import * as React from "react";

export const EASE_OUT = [0.16, 1, 0.3, 1] as const;
export const EASE_IN_OUT = [0.65, 0, 0.35, 1] as const;

/** Container that releases its children one after another. */
export const staggerParent = (stagger = 0.06, delay = 0): Variants => ({
  hidden: {},
  show: {
    transition: { staggerChildren: stagger, delayChildren: delay },
  },
});

/** The child of a `staggerParent`. */
export const riseChild: Variants = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: EASE_OUT } },
};

export const fadeChild: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { duration: 0.45, ease: EASE_OUT } },
};

type FadeInProps = HTMLMotionProps<"div"> & {
  delay?: number;
  y?: number;
  /** Animate when scrolled into view instead of on mount. */
  whenVisible?: boolean;
};

/** Single element that fades and rises into place. */
export function FadeIn({
  delay = 0,
  y = 12,
  whenVisible = false,
  children,
  ...props
}: FadeInProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div {...(props as React.ComponentProps<"div">)}>{children as React.ReactNode}</div>;

  const animateProps = whenVisible
    ? { whileInView: { opacity: 1, y: 0 }, viewport: { once: true, margin: "-80px" } }
    : { animate: { opacity: 1, y: 0 } };

  return (
    <motion.div
      initial={{ opacity: 0, y }}
      {...animateProps}
      transition={{ duration: 0.55, ease: EASE_OUT, delay }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

type StaggerProps = HTMLMotionProps<"div"> & {
  stagger?: number;
  delay?: number;
  whenVisible?: boolean;
};

/**
 * Wrap a group of `<Rise>` children to reveal them in sequence.
 * Used for dashboard card grids and marketing feature rows.
 */
export function Stagger({
  stagger = 0.06,
  delay = 0,
  whenVisible = false,
  children,
  ...props
}: StaggerProps) {
  const reduce = useReducedMotion();

  if (reduce) return <div {...(props as React.ComponentProps<"div">)}>{children as React.ReactNode}</div>;

  return (
    <motion.div
      variants={staggerParent(stagger, delay)}
      initial="hidden"
      {...(whenVisible
        ? { whileInView: "show" as const, viewport: { once: true, margin: "-60px" } }
        : { animate: "show" as const })}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/** A child of `<Stagger>`. */
export function Rise({ children, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  if (reduce) return <div {...(props as React.ComponentProps<"div">)}>{children as React.ReactNode}</div>;
  return (
    <motion.div variants={riseChild} {...props}>
      {children}
    </motion.div>
  );
}

/** Page-level entrance wrapper. Every dashboard page opens with this. */
export function PageTransition({ children, ...props }: HTMLMotionProps<"div">) {
  const reduce = useReducedMotion();
  if (reduce) return <div {...(props as React.ComponentProps<"div">)}>{children as React.ReactNode}</div>;
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE_OUT }}
      {...props}
    >
      {children}
    </motion.div>
  );
}

/**
 * Counts a financial figure up to its value.
 *
 * The value shown always comes from the caller — this only animates the
 * approach to it, and snaps straight to the real number under reduced motion
 * or whenever the value is not finite.
 */
export function AnimatedNumber({
  value,
  format,
  duration = 0.9,
  className,
}: {
  value: number;
  format: (n: number) => string;
  duration?: number;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const [display, setDisplay] = React.useState(() =>
    reduce || !Number.isFinite(value) ? value : 0
  );
  const fromRef = React.useRef(0);

  React.useEffect(() => {
    if (reduce || !Number.isFinite(value)) {
      setDisplay(value);
      return;
    }
    const from = fromRef.current;
    const start = performance.now();
    const ms = duration * 1000;
    let frame = 0;

    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      // easeOutExpo — fast start, long settle
      const eased = t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
      setDisplay(from + (value - from) * eased);
      if (t < 1) frame = requestAnimationFrame(tick);
      else fromRef.current = value;
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value, duration, reduce]);

  return <span className={className}>{format(display)}</span>;
}
