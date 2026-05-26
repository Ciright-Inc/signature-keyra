"use client";

import type { ReactNode } from "react";

type Props = {
  children: ReactNode;
  delay?: number;
  className?: string;
};

/** CSS-only entrance — respects prefers-reduced-motion without Framer warnings. */
export function FadeIn({ children, delay = 0, className }: Props) {
  return (
    <div
      className={["keyra-fade-in", className].filter(Boolean).join(" ")}
      style={{ animationDelay: delay > 0 ? `${delay}s` : undefined }}
    >
      {children}
    </div>
  );
}
