import { Link } from 'react-router';
import { buttonClasses } from './buttonStyles';

/** A link styled as a button. */
export function ButtonLink({ to, variant, size, className, children, ...props }) {
  return (
    <Link to={to} className={buttonClasses({ variant, size, className })} {...props}>
      {children}
    </Link>
  );
}
