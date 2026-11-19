import { useState } from 'react';
import {
  BookMarked,
  CalendarCheck,
  CheckCircle2,
  Crown,
  Infinity as InfinityIcon,
  ListChecks,
  Loader2,
} from 'lucide-react';
import { proFeatures } from '../../content/marketing';
import { userService } from '../../services/userService';
import { Button } from '../ui/Button';

const featureIcons = [CalendarCheck, BookMarked, InfinityIcon, ListChecks];

/** "Coming soon" card for the planned Pro plan, with a real waitlist sign-up. */
export function ProUpgradeCard({ isOnWaitlist }) {
  const [hasJoined, setHasJoined] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [error, setError] = useState('');
  const joined = isOnWaitlist || hasJoined;

  async function joinWaitlist() {
    setIsJoining(true);
    setError('');
    try {
      await userService.joinProWaitlist();
      setHasJoined(true);
    } catch (joinError) {
      setError(joinError.message);
    } finally {
      setIsJoining(false);
    }
  }

  return (
    <section
      id="pro"
      className="relative scroll-mt-24 overflow-hidden rounded-[32px] bg-ink-900 p-6 text-white sm:p-10"
    >
      <div
        className="pointer-events-none absolute -bottom-40 -left-24 size-[420px] rounded-full bg-brand-500/25 blur-[110px]"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute -top-32 right-0 size-80 rounded-full bg-amber-400/10 blur-[90px]"
        aria-hidden="true"
      />

      <div className="relative grid gap-10 lg:grid-cols-[1fr_1.3fr] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-300 to-amber-500 px-3 py-1 text-xs font-semibold text-ink-900">
              <Crown className="size-3.5" aria-hidden="true" />
              InterviewOS Pro
            </span>
            <span className="rounded-full border border-white/15 px-3 py-1 text-xs font-medium text-slate-300">
              Coming soon
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
            Prepare every day, for <span className="text-brand-300">every company</span>
          </h2>
          <p className="mt-3 max-w-md leading-relaxed text-slate-300">
            Pro adds a daily interview and the important topics for each company. It is not available yet. Join the
            waitlist and we will tell you as soon as it launches.
          </p>

          <div className="mt-7">
            {joined ? (
              <p className="inline-flex items-center gap-2 rounded-full bg-brand-500/15 px-4 py-2.5 text-sm font-medium text-brand-200 ring-1 ring-brand-400/30">
                <CheckCircle2 className="size-4" aria-hidden="true" />
                You are on the waitlist. We will let you know when Pro launches.
              </p>
            ) : (
              <Button size="lg" onClick={joinWaitlist} disabled={isJoining}>
                {isJoining ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  <Crown className="size-4" aria-hidden="true" />
                )}
                Notify me when Pro launches
              </Button>
            )}
            {error && <p className="mt-3 text-sm text-red-300">{error}</p>}
          </div>
        </div>

        <ul className="grid gap-3 sm:grid-cols-2">
          {proFeatures.map(({ title, text }, index) => {
            const Icon = featureIcons[index % featureIcons.length];
            return (
              <li key={title} className="rounded-2xl border border-white/10 bg-white/[0.05] p-5 backdrop-blur">
                <span className="flex size-10 items-center justify-center rounded-xl bg-brand-500/15">
                  <Icon className="size-5 text-brand-300" aria-hidden="true" />
                </span>
                <p className="mt-4 font-semibold text-white">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-slate-400">{text}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
