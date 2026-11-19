import { useState } from 'react';

/**
 * Small form helper: tracks values, submission state and errors.
 * Field-level errors from the API ({ field, message }) are shown next to the
 * matching input; anything else becomes a form-level message.
 * `onSubmit(values, { reset })` can clear the form after success.
 * `validate(values)` may return { field: message } to block submission client-side.
 */
export function useAsyncForm(initialValues, onSubmit, validate) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    setFieldErrors((current) => ({ ...current, [name]: undefined }));
  }

  function reset() {
    setValues(initialValues);
    setFieldErrors({});
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSubmitting) return;

    setFormError('');
    const clientErrors = validate?.(values) ?? {};
    setFieldErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) return;

    setIsSubmitting(true);

    try {
      await onSubmit(values, { reset });
    } catch (error) {
      const errorsByField = {};
      for (const { field, message } of error.details ?? []) {
        if (field in initialValues && !errorsByField[field]) errorsByField[field] = message;
      }

      if (Object.keys(errorsByField).length > 0) setFieldErrors(errorsByField);
      else setFormError(error.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit, reset };
}
