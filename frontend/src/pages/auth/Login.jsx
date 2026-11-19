import { Link, useLocation, useNavigate } from 'react-router';
import { Mail } from 'lucide-react';
import { AuthHeading } from '../../components/auth/AuthHeading';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/PasswordField';
import { TextField } from '../../components/ui/TextField';
import { useAsyncForm } from '../../hooks/useAsyncForm';
import { useAuth } from '../../hooks/useAuth';
import { homePathFor } from '../../utils/paths';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const notice = location.state?.notice;

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { email: '', password: '' },
    async (credentials) => {
      const user = await login(credentials);
      navigate(location.state?.from?.pathname ?? homePathFor(user), { replace: true });
    },
  );

  return (
    <>
      <AuthHeading title="Welcome back" description="Sign in to continue your interview preparation." />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {notice && <Alert tone="success">{notice}</Alert>}
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          label="Email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="you@example.com"
          icon={Mail}
          value={values.email}
          onChange={handleChange}
          error={fieldErrors.email}
          required
          autoFocus
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
          labelAction={
            <Link to="/forgot-password" className="text-sm font-medium text-brand-600 hover:text-brand-700">
              Forgot password?
            </Link>
          }
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        New to InterviewOS?{' '}
        <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
          Create an account
        </Link>
      </p>
    </>
  );
}
