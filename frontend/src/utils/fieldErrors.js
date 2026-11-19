/** Maps API field errors ({ field, message }) to an object keyed by field. */
export function fieldErrorsFrom(error) {
  const errors = {};
  for (const { field, message } of error?.details ?? []) {
    const key = field.split('.')[0];
    errors[key] ??= message;
  }
  return errors;
}
