import { cn } from '../../utils/cn';

export function SectionHeading({ eyebrow, title, description, align = 'center', className }) {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-2xl text-center' : 'max-w-xl', className)}>
      {eyebrow && <p className="text-sm font-semibold tracking-wide text-brand-600">{eyebrow}</p>}
      <h2 className="mt-3 text-3xl leading-tight font-semibold tracking-tight sm:text-[40px]">{title}</h2>
      {description && <p className="mt-4 text-base leading-relaxed text-ink-500 sm:text-lg">{description}</p>}
    </div>
  );
}
