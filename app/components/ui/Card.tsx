"use client";

import type { ComponentPropsWithoutRef } from "react";

type CardProps = ComponentPropsWithoutRef<"section">;

export function Card({ className = "", ...props }: CardProps) {
  return (
    <section
      className={`rounded-card border border-border-default bg-surface-secondary shadow-card ${className}`}
      {...props}
    />
  );
}