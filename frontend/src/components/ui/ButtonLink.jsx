import { Link } from 'react-router';
import { upcomingPaths } from '../../utils/paths';
import { buttonClasses } from './buttonStyles';

/** A link styled as a button. Links to pages from later phases render disabled. */
export function ButtonLink({ to, variant, size, className, children, ...props }) {
  const classes = buttonClasses({ variant, size, className });

  if (upcomingPaths.has(to)) {
    return (
      <span className={`${classes} pointer-events-none opacity-50`} aria-disabled="true" title="Available soon">
        {children}
      </span>
    );
  }

  return (
    <Link to={to} className={classes} {...props}>
      {children}
    </Link>
  );
}
