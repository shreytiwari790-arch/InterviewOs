const API_BASE_URL = `${(import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '')}/api`;

export class ApiError extends Error {
  constructor(message, status, details = []) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.details = details;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  const isFormData = body instanceof FormData;
  let response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      method,
      signal,
      credentials: 'include',
      headers: body && !isFormData ? { 'Content-Type': 'application/json' } : undefined,
      body: body && !isFormData ? JSON.stringify(body) : body,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError('Unable to reach the server. Check your connection and try again.', 0);
  }

  const data = response.status === 204 ? null : await response.json().catch(() => null);

  if (!response.ok) {
    throw new ApiError(data?.message ?? 'Something went wrong. Please try again.', response.status, data?.details);
  }
  return data;
}

export const api = {
  get: (path, options) => request(path, options),
  post: (path, body, options) => request(path, { ...options, method: 'POST', body }),
  put: (path, body, options) => request(path, { ...options, method: 'PUT', body }),
  patch: (path, body, options) => request(path, { ...options, method: 'PATCH', body }),
  delete: (path, options) => request(path, { ...options, method: 'DELETE' }),
};
