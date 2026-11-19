import { AppError } from '../utils/AppError.js';

/**
 * Validates req.body (default) or req.query against a Zod schema.
 * Parsed body replaces req.body; parsed query is exposed as req.validatedQuery
 * because req.query is read-only in Express 5.
 */
export function validate(schema, source = 'body') {
  return (req, res, next) => {
    const result = schema.safeParse(req[source] ?? {});

    if (!result.success) {
      const details = result.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      }));
      throw new AppError(400, 'Please check the highlighted fields', details);
    }

    if (source === 'body') req.body = result.data;
    else req.validatedQuery = result.data;
    next();
  };
}
