import { useState } from 'react';
import { Building2, CheckCircle2, LifeBuoy, Mail, MessageSquare, UserRound } from 'lucide-react';
import { useAsyncForm } from '../../hooks/useAsyncForm';
import { contactService } from '../../services/contactService';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextField } from '../ui/TextField';
import { SectionHeading } from './SectionHeading';

const topicOptions = [
  { value: 'general', label: 'General question' },
  { value: 'support', label: 'Help with my account' },
  { value: 'institution', label: 'Colleges & placement cells' },
  { value: 'feedback', label: 'Feedback or a suggestion' },
];

const reasons = [
  { icon: LifeBuoy, title: 'Account and product help', text: 'Questions about interviews, reports or your account.' },
  { icon: Building2, title: 'Colleges and teams', text: 'Bulk accounts and custom company profiles for your cohort.' },
  { icon: MessageSquare, title: 'Feedback', text: 'Tell us what would make your preparation better.' },
];

export function Contact() {
  const [sentMessage, setSentMessage] = useState('');

  const { values, fieldErrors, formError, isSubmitting, handleChange, handleSubmit } = useAsyncForm(
    { name: '', email: '', topic: 'general', message: '', website: '' },
    async (details, { reset }) => {
      const { message } = await contactService.sendMessage(details);
      setSentMessage(message);
      reset();
    },
  );

  return (
    <section id="contact" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-14 px-5 sm:px-8 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
        <div>
          <SectionHeading
            align="left"
            eyebrow="Contact us"
            title="Talk to the InterviewOS team"
            description="Send us a message and we will get back to you by email."
          />
          <ul className="mt-10 space-y-6">
            {reasons.map(({ icon: Icon, title, text }) => (
              <li key={title} className="flex gap-4">
                <span className="flex size-11 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                  <Icon className="size-5 text-brand-600" aria-hidden="true" />
                </span>
                <div>
                  <p className="font-medium text-ink-900">{title}</p>
                  <p className="mt-1 text-sm text-ink-500">{text}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/50 sm:p-8">
          {sentMessage ? (
            <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
              <span className="flex size-14 items-center justify-center rounded-full bg-brand-50">
                <CheckCircle2 className="size-7 text-brand-600" aria-hidden="true" />
              </span>
              <p className="mt-5 text-lg font-semibold text-ink-900">Message sent</p>
              <p className="mt-2 max-w-sm text-sm text-ink-500">{sentMessage}</p>
              <Button variant="secondary" className="mt-8" onClick={() => setSentMessage('')}>
                Send another message
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {formError && <Alert tone="error">{formError}</Alert>}
              <div className="grid gap-5 sm:grid-cols-2">
                <TextField
                  label="Name"
                  name="name"
                  icon={UserRound}
                  autoComplete="name"
                  placeholder="Your name"
                  value={values.name}
                  onChange={handleChange}
                  error={fieldErrors.name}
                  required
                />
                <TextField
                  label="Email"
                  name="email"
                  type="email"
                  icon={Mail}
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={values.email}
                  onChange={handleChange}
                  error={fieldErrors.email}
                  required
                />
              </div>
              <div>
                <label htmlFor="contact-topic" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Topic
                </label>
                <Select
                  id="contact-topic"
                  name="topic"
                  options={topicOptions}
                  value={values.topic}
                  onChange={handleChange}
                  className="[&_select]:h-11"
                />
              </div>
              <div>
                <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-ink-700">
                  Message
                </label>
                <textarea
                  id="contact-message"
                  name="message"
                  rows={5}
                  placeholder="How can we help?"
                  value={values.message}
                  onChange={handleChange}
                  aria-invalid={Boolean(fieldErrors.message)}
                  className={`w-full resize-none rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-900 shadow-xs transition placeholder:text-slate-400 focus:ring-4 focus:outline-none ${
                    fieldErrors.message
                      ? 'border-red-300 focus:border-red-400 focus:ring-red-100'
                      : 'border-slate-200 hover:border-slate-300 focus:border-brand-500 focus:ring-brand-100'
                  }`}
                />
                {fieldErrors.message && <p className="mt-1.5 text-xs text-red-600">{fieldErrors.message}</p>}
              </div>
              {/* Hidden from people; bots that fill every field are ignored by the server. */}
              <input
                type="text"
                name="website"
                value={values.website}
                onChange={handleChange}
                tabIndex={-1}
                autoComplete="off"
                className="hidden"
                aria-hidden="true"
              />
              <Button type="submit" variant="dark" size="lg" className="w-full" isLoading={isSubmitting}>
                Send message
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
