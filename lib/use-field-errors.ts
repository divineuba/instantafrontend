import * as React from "react";

/** Shared per-field validation state: track an error message per field key,
 * so forms can show inline errors on blur and block submission until every
 * field passes, instead of relying on a single generic error string. */
export function useFieldErrors<K extends string>() {
  const [errors, setErrors] = React.useState<Partial<Record<K, string>>>({});

  function setFieldError(field: K, message: string | undefined) {
    setErrors((prev) => {
      if (!message) {
        if (!(field in prev)) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }

  function clearErrors() {
    setErrors({});
  }

  /** Runs every validator, applies all resulting errors at once, and
   * returns whether the form is valid (so callers can block submit). */
  function validateAll(validators: Partial<Record<K, () => string | undefined>>) {
    const next: Partial<Record<K, string>> = {};
    for (const key in validators) {
      const message = validators[key]!();
      if (message) next[key] = message;
    }
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  return { errors, setFieldError, clearErrors, validateAll };
}
