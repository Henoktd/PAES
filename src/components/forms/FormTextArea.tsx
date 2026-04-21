import { forwardRef } from "react";
import type { TextareaHTMLAttributes } from "react";
import clsx from "clsx";

interface FormTextAreaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label: string;
  error?: string;
  description?: string;
  requiredIndicator?: boolean;
}

export const FormTextArea = forwardRef<HTMLTextAreaElement, FormTextAreaProps>(
  function FormTextArea(
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
        <textarea
          ref={ref}
          className={clsx("input", "textarea", className, error && "input--error")}
          {...props}
        />
        {error ? <small>{error}</small> : null}
      </label>
    );
  },
);
