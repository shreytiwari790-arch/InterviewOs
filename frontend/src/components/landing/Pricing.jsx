import { Link } from 'react-router';
import { Check } from 'lucide-react';
import { pricingPlans } from '../../content/marketing';
import { cn } from '../../utils/cn';
import { buttonClasses } from '../ui/buttonStyles';
import { SectionHeading } from './SectionHeading';

function PlanLink({ href, className, children }) {
  return href.startsWith('#') ? (
    <a href={href} className={className}>
      {children}
    </a>
  ) : (
    <Link to={href} className={className}>
      {children}
    </Link>
  );
}

export function Pricing() {
  return (
    <section id="pricing" className="scroll-mt-20 py-24 sm:py-28">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        <SectionHeading
          eyebrow="Pricing"
          title="Simple plans for every stage of prep"
          description="Start free. Upgrade when you are preparing for interviews week after week."
        />

        <div className="mt-16 grid gap-6 lg:grid-cols-3 lg:items-stretch">
          {pricingPlans.map((plan) => (
            <div
              key={plan.name}
              className={cn(
                'relative flex flex-col rounded-3xl p-8',
                plan.isFeatured
                  ? 'bg-ink-900 text-white shadow-2xl shadow-ink-900/25 lg:-my-4 lg:py-12'
                  : 'border border-slate-200 bg-white shadow-xs',
              )}
            >
              {plan.isFeatured && (
                <span className="absolute -top-3.5 left-8 rounded-full bg-brand-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className={cn('text-lg font-semibold', plan.isFeatured && 'text-white')}>{plan.name}</h3>
              <p className={cn('mt-2 text-sm leading-relaxed', plan.isFeatured ? 'text-slate-300' : 'text-ink-500')}>
                {plan.description}
              </p>
              <p className="mt-6 flex items-baseline gap-2">
                <span
                  className={cn(
                    'text-4xl font-semibold tracking-tight',
                    plan.isFeatured ? 'text-white' : 'text-ink-900',
                  )}
                >
                  {plan.price}
                </span>
                <span className={cn('text-sm', plan.isFeatured ? 'text-slate-400' : 'text-ink-500')}>
                  {plan.period}
                </span>
              </p>

              <ul className="mt-8 flex-1 space-y-3.5">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-3 text-sm">
                    <span
                      className={cn(
                        'mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full',
                        plan.isFeatured ? 'bg-brand-500/20' : 'bg-brand-50',
                      )}
                    >
                      <Check
                        className={cn('size-3', plan.isFeatured ? 'text-brand-300' : 'text-brand-600')}
                        strokeWidth={3}
                      />
                    </span>
                    <span className={plan.isFeatured ? 'text-slate-200' : 'text-ink-700'}>{feature}</span>
                  </li>
                ))}
              </ul>

              <PlanLink
                href={plan.href}
                className={buttonClasses({
                  variant: plan.isFeatured ? 'primary' : 'secondary',
                  size: 'lg',
                  className: 'mt-10 w-full',
                })}
              >
                {plan.cta}
              </PlanLink>
            </div>
          ))}
        </div>
        <p className="mt-10 text-center text-sm text-ink-500">All prices are in INR.</p>
      </div>
    </section>
  );
}
