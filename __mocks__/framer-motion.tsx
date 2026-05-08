import React from "react";

export const AnimatePresence = ({ children }: { children?: React.ReactNode; mode?: string }) => (
  <>{children}</>
);

export const motion = {
  div: React.forwardRef(
    (
      {
        children,
        initial: _i,
        animate: _a,
        exit: _e,
        transition: _t,
        ...rest
      }: React.HTMLAttributes<HTMLDivElement> & {
        children?: React.ReactNode;
        initial?: unknown;
        animate?: unknown;
        exit?: unknown;
        transition?: unknown;
      },
      ref: React.Ref<HTMLDivElement>
    ) => (
      <div ref={ref} {...rest}>
        {children}
      </div>
    )
  ),
};
