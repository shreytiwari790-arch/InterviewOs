import { Link } from 'react-router';
import {
  ArrowRight,
  BarChart3,
  Building2,
  Check,
  ClipboardCheck,
  FileSearch,
  Heart,
  Layers,
  Lock,
  Quote,
  ShieldCheck,
  Sparkles,
  Target,
  UploadCloud,
} from 'lucide-react';
import { Contact } from '../components/landing/Contact';
import { Faq } from '../components/landing/Faq';
import { Footer } from '../components/landing/Footer';
import { Hero } from '../components/landing/Hero';
import { Navbar } from '../components/landing/Navbar';
import { Pricing } from '../components/landing/Pricing';
import { SectionHeading } from '../components/landing/SectionHeading';
import { buttonClasses } from '../components/ui/buttonStyles';
import { companies, testimonials } from '../content/marketing';
import interviewPhoto from '../assets/images/interview-conversation.jpg';
import teamPhoto from '../assets/images/team-workspace.jpg';
import { paths } from '../utils/paths';

const steps = [
  {
    icon: UploadCloud,
    title: 'Upload your resume',
    text: 'Drop in a PDF or DOCX. We pick out your skills, projects and experience so questions sound like they were written for you.',
  },
  {
    icon: Building2,
    title: 'Choose company and role',
    text: 'TCS Digital, Infosys SP, Amazon SDE and more. Each track follows its own mix of topics, difficulty and duration.',
  },
  {
    icon: BarChart3,
    title: 'Practise and get your report',
    text: 'Answer one question at a time against the clock, then see scores by category, weak topics and what to study next.',
  },
];

const features = [
  {
    icon: FileSearch,
    title: 'Resume-aware questions',
    text: 'Questions reference the languages, frameworks and projects you actually list.',
  },
  {
    icon: Layers,
    title: 'Six question categories',
    text: 'Resume, MCQs, programming knowledge, core CS, scenarios and HR, weighted per role.',
  },
  {
    icon: ClipboardCheck,
    title: 'Rubric-based scoring',
    text: 'MCQs are checked exactly. Written answers are scored on correctness, relevance, completeness and clarity.',
  },
  {
    icon: Target,
    title: 'Weak-topic tracking',
    text: 'Your dashboard follows every topic across interviews so you always know what to revise.',
  },
  {
    icon: ShieldCheck,
    title: 'Exam-like integrity mode',
    text: 'Optional fullscreen and focus checks, kept completely separate from your score.',
  },
  {
    icon: Lock,
    title: 'Private by design',
    text: 'Answer keys never reach your browser and your resume is never shared with employers.',
  },
];

const spotlightPoints = [
  'Follow-up questions that dig into your answers',
  'Feedback on what you missed, not just a score',
  'Timed sessions that feel like the real round',
];

const values = [
  { icon: Target, title: 'Practice with purpose', text: 'Every question is tied to the role you are preparing for.' },
  { icon: Heart, title: 'Honest feedback', text: 'Clear, specific notes on what to improve, never inflated scores.' },
  { icon: Lock, title: 'Your data, your control', text: 'Delete your resume and history whenever you like.' },
];

function CompaniesMarquee() {
  const row = [...companies, ...companies];
  return (
    <section className="border-y border-slate-200/70 bg-white py-10">
      <p className="text-center text-sm font-medium text-ink-500">Preparation tracks for interviews at</p>
      <div className="relative mt-6 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <ul className="flex w-max animate-marquee gap-16 pr-16 hover:[animation-play-state:paused]">
          {row.map((company, index) => (
            <li
              key={`${company}-${index}`}
              className="text-2xl font-semibold tracking-tight whitespace-nowrap text-slate-300"
            >
              {company}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function HowItWorks() {
  return (
    <section id="how-it-works" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="How it works" title="Three steps to walk in confident" />
        <ol className="mt-16 grid gap-6 md:grid-cols-3">
          {steps.map(({ icon: Icon, title, text }, index) => (
            <li
              key={title}
              className="group relative rounded-3xl border border-slate-200 bg-white p-8 transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-xl hover:shadow-brand-900/5"
            >
              <div className="flex items-center justify-between">
                <span className="flex size-12 items-center justify-center rounded-2xl bg-brand-50 transition-colors group-hover:bg-brand-500">
                  <Icon className="size-6 text-brand-600 transition-colors group-hover:text-white" aria-hidden="true" />
                </span>
                <span className="text-5xl font-semibold text-slate-100">{index + 1}</span>
              </div>
              <h3 className="mt-8 text-lg font-semibold">{title}</h3>
              <p className="mt-3 text-[15px] leading-relaxed text-ink-500">{text}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function PracticeSpotlight() {
  return (
    <section className="bg-brand-50/50 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="relative">
          <img
            src={interviewPhoto}
            alt="A candidate talking confidently with an interviewer"
            className="aspect-[4/3] w-full rounded-[28px] object-cover shadow-2xl shadow-brand-900/15"
            loading="lazy"
          />
          <div className="absolute -right-3 -bottom-6 max-w-[260px] animate-float rounded-2xl border border-slate-100 bg-white p-4 shadow-xl sm:-right-6">
            <div className="flex items-center gap-2 text-sm font-semibold text-ink-900">
              <Sparkles className="size-4 text-brand-500" aria-hidden="true" />
              Answer feedback
            </div>
            <p className="mt-2 text-xs leading-relaxed text-ink-500">
              Good structure. Mention how you measured the impact to make this answer complete.
            </p>
          </div>
        </div>
        <div>
          <SectionHeading
            align="left"
            eyebrow="Get started"
            title="Practise the conversation, not just the questions"
            description="Real interviews reward clear thinking under pressure. InterviewOS gives you a safe place to build that habit before it counts."
          />
          <ul className="mt-8 space-y-4">
            {spotlightPoints.map((point) => (
              <li key={point} className="flex items-center gap-3 text-[15px] text-ink-700">
                <span className="flex size-6 items-center justify-center rounded-full bg-brand-500">
                  <Check className="size-3.5 text-white" strokeWidth={3} aria-hidden="true" />
                </span>
                {point}
              </li>
            ))}
          </ul>
          <Link
            to={paths.register}
            className={buttonClasses({ variant: 'dark', size: 'lg', className: 'group mt-10' })}
          >
            Get started free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

function Features() {
  return (
    <section id="features" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything you need to prepare with intent"
          description="Built around how technical and campus interviews are actually structured."
        />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ icon: Icon, title, text }) => (
            <div
              key={title}
              className="rounded-3xl border border-slate-200 bg-white p-7 transition-colors hover:border-brand-200"
            >
              <span className="flex size-11 items-center justify-center rounded-2xl bg-brand-50">
                <Icon className="size-5 text-brand-600" aria-hidden="true" />
              </span>
              <h3 className="mt-6 text-base font-semibold">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-500">{text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function About() {
  return (
    <section id="about" className="scroll-mt-20 bg-slate-50/70 py-24 sm:py-28">
      <div className="mx-auto grid max-w-6xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
        <div className="order-2 lg:order-1">
          <SectionHeading
            align="left"
            eyebrow="About us"
            title="We are building the interview coach we wished we had"
            description="Most interview prep is a list of random questions. We think it should start with you: your resume, your target company and the exact role you want."
          />
          <p className="mt-5 text-base leading-relaxed text-ink-500">
            InterviewOS brings those together into realistic practice sessions and reports that tell you what to do
            next. Company profiles are preparation guides based on publicly available information, not official
            interview papers, and we are always clear about that.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {values.map(({ icon: Icon, title, text }) => (
              <div key={title} className="rounded-2xl border border-slate-200 bg-white p-5">
                <Icon className="size-5 text-brand-600" aria-hidden="true" />
                <p className="mt-3 text-sm font-semibold text-ink-900">{title}</p>
                <p className="mt-1 text-xs leading-relaxed text-ink-500">{text}</p>
              </div>
            ))}
          </div>
        </div>
        <img
          src={teamPhoto}
          alt="Two people working together on laptops"
          className="order-1 aspect-[4/3] w-full rounded-[28px] object-cover shadow-2xl shadow-ink-900/10 lg:order-2"
          loading="lazy"
        />
      </div>
    </section>
  );
}

function Testimonials() {
  if (testimonials.length === 0) return null;
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading eyebrow="Reviews" title="What candidates say" />
        <div className="mt-16 grid gap-6 md:grid-cols-3">
          {testimonials.map(({ name, role, quote }) => (
            <figure key={name} className="rounded-3xl border border-slate-200 bg-white p-7">
              <Quote className="size-6 fill-brand-100 text-brand-500" aria-hidden="true" />
              <blockquote className="mt-4 text-[15px] leading-relaxed text-ink-700">{quote}</blockquote>
              <figcaption className="mt-6">
                <p className="text-sm font-semibold text-ink-900">{name}</p>
                <p className="text-xs text-ink-500">{role}</p>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

function FinalCta() {
  return (
    <section className="px-5 pb-24 sm:px-8">
      <div className="relative mx-auto max-w-6xl overflow-hidden rounded-[32px] bg-ink-900 px-6 py-16 text-center sm:px-16 sm:py-20">
        <div
          className="pointer-events-none absolute -top-40 left-1/2 size-[560px] -translate-x-1/2 rounded-full bg-brand-500/30 blur-[120px]"
          aria-hidden="true"
        />
        <div className="relative">
          <h2 className="mx-auto max-w-2xl text-3xl leading-tight font-semibold tracking-tight text-white sm:text-[40px]">
            Your next interview could be <span className="text-brand-300">your best one</span>
          </h2>
          <p className="mx-auto mt-5 max-w-lg text-base text-slate-300">
            Upload your resume, choose a company and get a personalised mock interview in minutes.
          </p>
          <Link
            to={paths.register}
            className={buttonClasses({ variant: 'primary', size: 'lg', className: 'group mt-10' })}
          >
            Try now for free
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Landing() {
  return (
    <div className="bg-white">
      <Navbar />
      <main>
        <Hero />
        <CompaniesMarquee />
        <HowItWorks />
        <PracticeSpotlight />
        <Features />
        <About />
        <Pricing />
        <Testimonials />
        <Faq />
        <Contact />
        <FinalCta />
      </main>
      <Footer />
    </div>
  );
}
