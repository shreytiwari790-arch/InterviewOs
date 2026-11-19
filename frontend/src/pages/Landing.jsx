import { useState } from 'react';
import { Link } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ClipboardCheck,
  FileSearch,
  FileText,
  Layers,
  Menu,
  PlayCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { InterviewPreview } from '../components/marketing/InterviewPreview';
import { Logo } from '../components/ui/Logo';
import { buttonClasses } from '../components/ui/buttonStyles';
import { useAuth } from '../hooks/useAuth';
import { homePathFor, paths } from '../utils/paths';

const navLinks = [
  { href: '#how-it-works', label: 'How it works' },
  { href: '#features', label: 'Features' },
  { href: '#companies', label: 'Companies' },
];

const companies = ['Amazon', 'Google', 'Microsoft', 'TCS', 'Infosys', 'Deloitte', 'Accenture'];

const steps = [
  {
    icon: FileText,
    title: 'Upload your resume',
    text: 'PDF or DOCX. We extract your skills, projects and experience.',
  },
  { icon: Building2, title: 'Pick a company and role', text: 'Choose a track such as TCS Digital or Amazon SDE.' },
  { icon: PlayCircle, title: 'Take the interview', text: 'A timed, text-based interview, one question at a time.' },
  { icon: BarChart3, title: 'Review your report', text: 'Scores by category, weak topics and what to study next.' },
];

const features = [
  {
    icon: FileSearch,
    title: 'Resume-aware questions',
    text: 'Questions reference the languages, frameworks and projects on your resume, so practice feels like the real conversation.',
  },
  {
    icon: Building2,
    title: 'Company-specific patterns',
    text: 'Each company and role has its own question mix, topics, difficulty and duration, configured and kept up to date by administrators.',
  },
  {
    icon: Layers,
    title: 'Six question categories',
    text: 'Resume and projects, MCQs, programming knowledge, core CS, scenarios and HR, weighted per role.',
  },
  {
    icon: ClipboardCheck,
    title: 'Rubric-based evaluation',
    text: 'MCQs are scored exactly. Written answers are evaluated for correctness, relevance, completeness and clarity.',
  },
  {
    icon: BarChart3,
    title: 'Reports you can act on',
    text: 'See category scores, strong and weak topics, per-answer feedback and a focused list of what to prepare next.',
  },
  {
    icon: ShieldCheck,
    title: 'Optional integrity checks',
    text: 'Practise under exam-like conditions with fullscreen and focus tracking, kept separate from your score.',
  },
];

const benefits = [
  'Answer keys never reach your browser during an interview',
  'Track progress across every interview you take',
  'Integrity signals never change your knowledge score',
  'Your resume is used only to personalise your practice',
];

function LandingNav() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const accountActions = user ? (
    <Link to={homePathFor(user)} className={buttonClasses({ size: 'sm' })}>
      Go to dashboard
    </Link>
  ) : (
    <>
      <Link to={paths.login} className={buttonClasses({ variant: 'ghost', size: 'sm' })}>
        Sign in
      </Link>
      <Link to={paths.register} className={buttonClasses({ size: 'sm' })}>
        Start preparing
      </Link>
    </>
  );

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/60 bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link to={paths.home} aria-label="InterviewOS home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary">
          {navLinks.map(({ href, label }) => (
            <a
              key={href}
              href={href}
              className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-900"
            >
              {label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-2 md:flex">{accountActions}</div>

        <button
          type="button"
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 md:hidden"
          onClick={() => setIsMenuOpen((open) => !open)}
          aria-expanded={isMenuOpen}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
        >
          {isMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
        </button>
      </div>

      {isMenuOpen && (
        <div className="border-t border-slate-200/60 bg-white px-5 py-4 md:hidden">
          <nav className="flex flex-col gap-1" aria-label="Mobile">
            {navLinks.map(({ href, label }) => (
              <a
                key={href}
                href={href}
                onClick={() => setIsMenuOpen(false)}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                {label}
              </a>
            ))}
          </nav>
          <div className="mt-3 flex gap-2 border-t border-slate-100 pt-4 [&>a]:flex-1">{accountActions}</div>
        </div>
      )}
    </header>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] bg-gradient-to-b from-brand-50/80 via-white to-white"
        aria-hidden="true"
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-[640px] opacity-70"
        style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgb(99 102 241 / 0.16) 1px, transparent 0)',
          backgroundSize: '28px 28px',
          maskImage: 'radial-gradient(ellipse 60% 55% at 50% 0%, black, transparent)',
        }}
        aria-hidden="true"
      />

      <div className="relative mx-auto max-w-6xl px-5 pt-16 pb-20 sm:px-8 sm:pt-24 lg:grid lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16 lg:pt-28 lg:pb-28">
        <div className="max-w-xl">
          <p className="inline-flex items-center gap-2 rounded-full border border-brand-200/70 bg-white px-3 py-1 text-xs font-medium text-brand-700 shadow-xs">
            <span className="size-1.5 rounded-full bg-brand-500" />
            AI interview preparation
          </p>
          <h1 className="mt-6 text-4xl leading-[1.1] font-semibold tracking-tight text-slate-900 sm:text-5xl lg:text-[56px]">
            Prepare for the interview your target company actually runs.
          </h1>
          <p className="mt-6 text-lg leading-relaxed text-slate-600">
            InterviewOS turns your resume and your target role into a realistic mock interview, then shows you exactly
            what to work on next.
          </p>
          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <Link to={paths.register} className={buttonClasses({ size: 'lg' })}>
              Start preparing
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
            <a href="#features" className={buttonClasses({ variant: 'secondary', size: 'lg' })}>
              Explore features
            </a>
          </div>
        </div>

        <div className="mt-16 lg:mt-0">
          <InterviewPreview className="mx-auto max-w-[480px]" />
        </div>
      </div>
    </section>
  );
}

function CompaniesStrip() {
  return (
    <section id="companies" className="scroll-mt-20 border-y border-slate-200/70 bg-slate-50/60">
      <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">
        <p className="text-center text-sm font-medium text-slate-500">Preparation tracks for companies including</p>
        <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
          {companies.map((company) => (
            <li key={company} className="text-lg font-semibold tracking-tight text-slate-400">
              {company}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="mx-auto max-w-2xl text-center">
      <p className="text-sm font-semibold text-brand-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-slate-600">{description}</p>}
    </div>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="How it works" title="From resume to report in four steps" />
        <ol className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li key={title} className="relative rounded-xl border border-slate-200/80 bg-white p-6 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="flex size-10 items-center justify-center rounded-lg bg-brand-50">
                  <Icon className="size-5 text-brand-600" aria-hidden="true" />
                </span>
                <span className="text-sm font-semibold text-slate-300 tabular-nums">0{index + 1}</span>
              </div>
              <h3 className="mt-5 text-[15px] font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 bg-slate-50/60 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to practise with intent"
          description="Built around how technical interviews are actually structured, not generic question lists."
        />
        <div className="mt-16 grid gap-px overflow-hidden rounded-2xl border border-slate-200/80 bg-slate-200/80 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-white p-7">
              <Icon className="size-5 text-brand-600" aria-hidden="true" />
              <h3 className="mt-4 text-[15px] font-semibold text-slate-900">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Benefits() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-12 px-5 sm:px-8 lg:grid-cols-2 lg:items-center lg:gap-20">
        <div>
          <p className="text-sm font-semibold text-brand-600">Why InterviewOS</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Practice that is fair, focused and private
          </h2>
          <p className="mt-4 text-base leading-relaxed text-slate-600">
            Company profiles are preparation guides based on publicly available information. They help you practise the
            right material; they are not official interview patterns.
          </p>
        </div>
        <ul className="space-y-4">
          {benefits.map((benefit) => (
            <li key={benefit} className="flex gap-4 rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
              <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-emerald-50">
                <Check className="size-3.5 text-emerald-600" aria-hidden="true" />
              </span>
              <span className="text-sm font-medium text-slate-800">{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="mx-auto max-w-6xl px-5 pb-24 sm:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-slate-950 px-6 py-16 text-center sm:px-16 sm:py-20">
        <div
          className="pointer-events-none absolute -top-32 left-1/2 size-[520px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-[110px]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            Your next interview starts with practice.
          </h2>
          <p className="mx-auto mt-4 max-w-lg text-base text-slate-400">
            Upload your resume, choose a company and get a personalised mock interview in minutes.
          </p>
          <Link
            to={paths.register}
            className={buttonClasses({
              size: 'lg',
              className: 'mt-9 bg-white !text-slate-900 shadow-none hover:bg-slate-100',
            })}
          >
            Create your account
            <ArrowRight className="size-4" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200/70">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-12 sm:px-8 md:flex-row md:items-start md:justify-between">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            AI-powered interview preparation tailored to your resume and target company.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-12 text-sm">
          <div>
            <p className="font-semibold text-slate-900">Product</p>
            <ul className="mt-4 space-y-3 text-slate-500">
              {navLinks.map(({ href, label }) => (
                <li key={href}>
                  <a href={href} className="hover:text-slate-900">
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="font-semibold text-slate-900">Account</p>
            <ul className="mt-4 space-y-3 text-slate-500">
              <li>
                <Link to={paths.login} className="hover:text-slate-900">
                  Sign in
                </Link>
              </li>
              <li>
                <Link to={paths.register} className="hover:text-slate-900">
                  Create account
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div className="border-t border-slate-200/70">
        <p className="mx-auto max-w-6xl px-5 py-6 text-xs text-slate-400 sm:px-8">
          © {new Date().getFullYear()} InterviewOS. Company names are used only to identify preparation tracks and do
          not imply affiliation.
        </p>
      </div>
    </footer>
  );
}

export default function Landing() {
  return (
    <div className="bg-white">
      <LandingNav />
      <main>
        <Hero />
        <CompaniesStrip />
        <HowItWorks />
        <Features />
        <Benefits />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
