import { Link, useNavigate, useSearchParams } from 'react-router';
import { AuthHeading } from '../../components/auth/AuthHeading';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { buttonClasses } from '../../components/ui/buttonStyles';
import { PasswordField } from '../../components/ui/PasswordField';
import { useAsyncForm } from '../../hooks/useAsyncForm';
import { authService } from '../../services/authService';

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token') ?? '';

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { password: '', confirmPassword: '' },
    async ({ password }) => {
      const { message } = await authService.resetPassword(token, password);
      navigate('/login', { replace: true, state: { notice: message } });
    },
    ({ password, confirmPassword }) =>
      password === confirmPassword ? {} : { confirmPassword: 'Passwords do not match' },
  );

  if (!/^[a-f0-9]{64}$/.test(token)) {
    return (
      <>
        <AuthHeading title="Link not valid" description="This password reset link is incomplete or has been altered." />
        <Link to="/forgot-password" className={buttonClasses({ size: 'lg', className: 'w-full' })}>
          Request a new link
        </Link>
      </>
    );
  }

  return (
    <>
      <AuthHeading title="Choose a new password" description="After resetting, you'll be signed out of every device." />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && (
          <Alert tone="error">
            {formError}{' '}
            <Link to="/forgot-password" className="font-medium underline underline-offset-2">
              Request a new link
            </Link>
          </Alert>
        )}

        <PasswordField
          label="New password"
          name="password"
          autoComplete="new-password"
          hint="At least 8 characters, including a letter and a number."
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
          autoFocus
        />
        <PasswordField
          label="Confirm new password"
          name="confirmPassword"
          autoComplete="new-password"
          value={values.confirmPassword}
          onChange={handleChange}
          error={fieldErrors.confirmPassword}
          required
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Reset password
        </Button>
      </form>
    </>
  );
}
