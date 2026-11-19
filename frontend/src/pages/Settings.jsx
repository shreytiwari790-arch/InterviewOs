import { useState } from 'react';
import { Mail, UserRound } from 'lucide-react';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { PasswordField } from '../components/ui/PasswordField';
import { TextField } from '../components/ui/TextField';
import { useAsyncForm } from '../hooks/useAsyncForm';
import { useAuth } from '../hooks/useAuth';
import { userService } from '../services/userService';

function ProfileForm() {
  const { user, setUser } = useAuth();
  const [savedMessage, setSavedMessage] = useState('');

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { name: user.name },
    async (details) => {
      setSavedMessage('');
      const { user: updatedUser } = await userService.updateProfile(details);
      setUser(updatedUser);
      setSavedMessage('Profile updated.');
    },
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CardBody className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        {savedMessage && <Alert tone="success">{savedMessage}</Alert>}
        <TextField
          label="Full name"
          name="name"
          icon={UserRound}
          value={values.name}
          onChange={handleChange}
          error={fieldErrors.name}
          autoComplete="name"
          required
        />
        <TextField
          label="Email"
          icon={Mail}
          value={user.email}
          disabled
          hint="Your sign-in email cannot be changed."
          className="[&_input]:bg-slate-50 [&_input]:text-slate-500"
        />
      </CardBody>
      <div className="flex justify-end border-t border-slate-100 px-6 py-4">
        <Button type="submit" isLoading={isSubmitting} disabled={values.name.trim() === user.name}>
          Save changes
        </Button>
      </div>
    </form>
  );
}

function PasswordForm() {
  const [savedMessage, setSavedMessage] = useState('');

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { currentPassword: '', newPassword: '', confirmPassword: '' },
    async ({ currentPassword, newPassword }, { reset }) => {
      setSavedMessage('');
      const { message } = await userService.changePassword({ currentPassword, newPassword });
      setSavedMessage(message);
      reset();
    },
    ({ newPassword, confirmPassword }) =>
      newPassword === confirmPassword ? {} : { confirmPassword: 'Passwords do not match' },
  );

  return (
    <form onSubmit={handleSubmit} noValidate>
      <CardBody className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        {savedMessage && <Alert tone="success">{savedMessage}</Alert>}
        <PasswordField
          label="Current password"
          name="currentPassword"
          autoComplete="current-password"
          value={values.currentPassword}
          onChange={handleChange}
          error={fieldErrors.currentPassword}
          required
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <PasswordField
            label="New password"
            name="newPassword"
            autoComplete="new-password"
            value={values.newPassword}
            onChange={handleChange}
            error={fieldErrors.newPassword}
            hint="At least 8 characters, a letter and a number."
            required
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
        </div>
      </CardBody>
      <div className="flex justify-end border-t border-slate-100 px-6 py-4">
        <Button type="submit" isLoading={isSubmitting}>
          Update password
        </Button>
      </div>
    </form>
  );
}

export default function Settings() {
  return (
    <div className="max-w-3xl">
      <PageHeader title="Settings" description="Manage your profile and account security." />
      <div className="space-y-6">
        <Card>
          <CardHeader title="Profile" description="How your name appears across InterviewOS." />
          <ProfileForm />
        </Card>
        <Card>
          <CardHeader title="Password" description="Changing your password signs you out on other devices." />
          <PasswordForm />
        </Card>
      </div>
    </div>
  );
}
