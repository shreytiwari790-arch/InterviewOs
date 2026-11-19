import { useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, Mail } from 'lucide-react';
import { AuthHeading } from '../../components/auth/AuthHeading';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { TextField } from '../../components/ui/TextField';
import { useAsyncForm } from '../../hooks/useAsyncForm';
import { authService } from '../../services/authService';

export default function ForgotPassword() {
  const [confirmation, setConfirmation] = useState('');

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { email: '' },
    async ({ email }) => {
      const { message } = await authService.requestPasswordReset(email);
      setConfirmation(message);
    },
  );

  return (
    <>
      <AuthHeading
        title="Reset your password"
        description="Enter the email you signed up with and we'll send you a link to choose a new password."
      />

      {confirmation ? (
        <Alert tone="success" title="Check your inbox">
          {confirmation}
        </Alert>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
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

          <Button type="submit" size="lg" className="w-full" isLoading={isSubmitting}>
            Send reset link
          </Button>
        </form>
      )}

      <Link
        to="/login"
        className="mt-8 inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        Back to sign in
      </Link>
    </>
  );
}
