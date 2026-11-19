export function AuthHeading({ title, description }) {
  return (
    <div className="mb-8">
      <h1 className="text-[28px] leading-tight font-semibold tracking-tight text-ink-900">{title}</h1>
      {description && <p className="mt-2.5 text-[15px] leading-relaxed text-slate-500">{description}</p>}
    </div>
  );
}
