import React from "react";

export const AnimatePresence = ({ children }: { children?: React.ReactNode; mode?: string }) => (
  <>{children}</>
);

type MotionProps = { children?: React.ReactNode; initial?: unknown; animate?: unknown; exit?: unknown; transition?: unknown };

export const motion = {
  div: React.forwardRef(
    (
      { children, initial: _i, animate: _a, exit: _e, transition: _t, ...rest }: React.HTMLAttributes<HTMLDivElement> & MotionProps,
      ref: React.Ref<HTMLDivElement>
    ) => <div ref={ref} {...rest}>{children}</div>
  ),
  p: React.forwardRef(
    (
      { children, initial: _i, animate: _a, exit: _e, transition: _t, ...rest }: React.HTMLAttributes<HTMLParagraphElement> & MotionProps,
      ref: React.Ref<HTMLParagraphElement>
    ) => <p ref={ref} {...rest}>{children}</p>
  ),
};
