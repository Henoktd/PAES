import type { ButtonHTMLAttributes, PropsWithChildren } from "react";
import clsx from "clsx";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement>, PropsWithChildren {
  variant?: "primary" | "secondary" | "ghost" | "danger";
}

export function Button({ children, className, variant = "primary", ...props }: ButtonProps) {
  return (
    <button className={clsx("btn", `btn--${variant}`, className)} {...props}>
      {children}
    </button>
  );
}
