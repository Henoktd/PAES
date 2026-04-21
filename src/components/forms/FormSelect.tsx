import { forwardRef } from "react";
import type { SelectHTMLAttributes } from "react";
import clsx from "clsx";

interface FormSelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  description?: string;
  requiredIndicator?: boolean;
  options: Array<{
    label: string;
    value: string;
  }>;
  placeholder?: string;
}

export const FormSelect = forwardRef<HTMLSelectElement, FormSelectProps>(function FormSelect(
  { label, error, description, requiredIndicator, className, options, placeholder, ...props },
  ref,
) {
  return (
    <label className="form-field">
      <span className="form-field__label">
        {label}
        {requiredIndicator ? <strong aria-hidden="true">*</strong> : null}
      </span>
      {description ? <em className="form-field__hint">{description}</em> : null}
      <select
        ref={ref}
        className={clsx("input", className, error && "input--error")}
        {...props}
      >
        <option value="">{placeholder ?? `Select ${label}`}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? <small>{error}</small> : null}
    </label>
  );
});
