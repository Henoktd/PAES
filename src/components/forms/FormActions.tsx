import type { PropsWithChildren } from "react";

export function FormActions({ children }: PropsWithChildren) {
  return <div className="form-actions">{children}</div>;
}
