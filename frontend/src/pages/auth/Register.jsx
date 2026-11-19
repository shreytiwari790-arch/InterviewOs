import { Link, useNavigate } from 'react-router';
import { Mail, UserRound } from 'lucide-react';
import { AuthHeading } from '../../components/auth/AuthHeading';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { PasswordField } from '../../components/ui/PasswordField';
import { TextField } from '../../components/ui/TextField';
import { useAsyncForm } from '../../hooks/useAsyncForm';
import { useAuth } from '../../hooks/useAuth';
import { paths } from '../../utils/paths';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { name: '', email: '', password: '' },
    async (details) => {
      await register(details);
      navigate(paths.dashboard, { replace: true });
    },
  );

  return (
    <>
      <AuthHeading
        title="Create your account"
        description="Upload your resume, pick a company and start a tailored mock interview."
      />

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        {formError && <Alert tone="error">{formError}</Alert>}

        <TextField
          label="Full name"
          name="name"
          autoComplete="name"
          placeholder="Your name"
          icon={UserRound}
          value={values.name}
          onChange={handleChange}
          error={fieldErrors.name}
          required
          autoFocus
        />
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
        />
        <PasswordField
          label="Password"
          name="password"
          autoComplete="new-password"
          placeholder="Create a password"
          hint="At least 8 characters, including a letter and a number."
          value={values.password}
          onChange={handleChange}
          error={fieldErrors.password}
          required
        />

        <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-slate-500">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
          Sign in
        </Link>
      </p>
    </>
  );
}
