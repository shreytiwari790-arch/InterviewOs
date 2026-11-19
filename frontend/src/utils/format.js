const dateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
const shortDateFormatter = new Intl.DateTimeFormat('en-IN', { day: 'numeric', month: 'short' });

export const formatDate = (value) => (value ? dateFormatter.format(new Date(value)) : '—');
export const formatShortDate = (value) => (value ? shortDateFormatter.format(new Date(value)) : '—');

export function greetingForTime(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

export const firstName = (name = '') => name.trim().split(/\s+/)[0];

export const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

/** Colour tone for a 0–100 score, used by badges and bars. */
export function scoreTone(score) {
  if (score >= 75) return 'success';
  if (score >= 50) return 'warning';
  return 'danger';
}
