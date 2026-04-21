import type { PropsWithChildren } from "react";
import clsx from "clsx";

interface CardProps extends PropsWithChildren {
  title?: string;
  subtitle?: string;
  className?: string;
}

export function Card({ title, subtitle, className, children }: CardProps) {
  return (
    <section className={clsx("card", className)}>
      {(title || subtitle) && (
        <header className="card__header">
          {title ? <h3>{title}</h3> : null}
          {subtitle ? <p>{subtitle}</p> : null}
        </header>
      )}
      {children}
    </section>
  );
}
