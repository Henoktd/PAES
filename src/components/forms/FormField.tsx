import { forwardRef } from "react";
import type { InputHTMLAttributes } from "react";
import clsx from "clsx";

interface FormFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  description?: string;
  requiredIndicator?: boolean;
}

export const FormField = forwardRef<HTMLInputElement, FormFieldProps>(function FormField(
  { label, error, description, requiredIndicator, className, ...props },
  ref,
) {
  return (
    <label className="form-field">
      <span className="form-field__label">
        {label}
        {requiredIndicator ? <strong aria-hidden="true">*</strong> : null}
      </span>
      {description ? <em className="form-field__hint">{description}</em> : null}
      <input
        ref={ref}
        className={clsx("input", className, error && "input--error")}
        {...props}
      />
      {error ? <small>{error}</small> : null}
    </label>
  );
});
