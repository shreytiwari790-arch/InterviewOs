// Removes keys that MongoDB would interpret as operators or paths ("$gt", "a.b")
// so user input can never change the shape of a query.
function stripOperatorKeys(value) {
  if (Array.isArray(value)) return value.map(stripOperatorKeys);

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([key]) => !key.startsWith('$') && !key.includes('.'))
        .map(([key, nested]) => [key, stripOperatorKeys(nested)]),
    );
  }

  return value;
}

// Express 5 parses query strings without nesting, so only the body can carry objects.
export function sanitizeInput(req, res, next) {
  if (req.body) req.body = stripOperatorKeys(req.body);
  next();
}
