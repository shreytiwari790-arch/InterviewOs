import { Briefcase, Code2, FolderGit2, GraduationCap, Layers, Lightbulb, Sparkles, Target, Wrench } from 'lucide-react';
import { Panel } from '../ui/Panel';

function Chips({ items, tone = 'neutral' }) {
  if (!items?.length) return <p className="text-sm text-ink-500">None found</p>;
  const classes =
    tone === 'brand' ? 'bg-brand-50 text-brand-800 ring-brand-100' : 'bg-slate-50 text-ink-700 ring-slate-200';
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span key={item} className={`rounded-full px-3 py-1 text-sm font-medium ring-1 ring-inset ${classes}`}>
          {item}
        </span>
      ))}
    </div>
  );
}

function SkillGroup({ icon: Icon, title, items, tone }) {
  return (
    <div className="rounded-2xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="mb-3 flex items-center justify-between gap-2 text-sm font-semibold text-ink-900">
        <span className="flex items-center gap-2">
          <Icon className="size-4 text-brand-600" aria-hidden="true" />
          {title}
        </span>
        <span className="text-xs font-medium text-ink-500 tabular-nums">{items?.length ?? 0}</span>
      </p>
      <Chips items={items} tone={tone} />
    </div>
  );
}

function GlanceTile({ icon: Icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-2xl border border-slate-200/80 bg-white p-4">
      <span className="flex size-10 items-center justify-center rounded-xl bg-brand-50">
        <Icon className="size-5 text-brand-600" aria-hidden="true" />
      </span>
      <div>
        <p className="text-xl leading-none font-semibold text-ink-900 tabular-nums">{value}</p>
        <p className="mt-1 text-xs text-ink-500">{label}</p>
      </div>
    </div>
  );
}

/** Everything the AI extracted from a resume, grouped into sections. */
export function ResumeAnalysis({ profile }) {
  const skillCount = [profile.programmingLanguages, profile.frameworks, profile.tools, profile.technicalSkills].reduce(
    (total, list) => total + (list?.length ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <GlanceTile icon={Layers} label="Skills found" value={skillCount} />
        <GlanceTile icon={FolderGit2} label="Projects" value={profile.projects?.length ?? 0} />
        <GlanceTile icon={Briefcase} label="Roles" value={profile.experience?.length ?? 0} />
        <GlanceTile icon={Target} label="Focus areas" value={profile.suggestedFocusAreas?.length ?? 0} />
      </div>

      <Panel icon={Code2} title="Skills" description="Grouped from your resume. Interview questions draw on these.">
        <div className="grid gap-3 md:grid-cols-2">
          <SkillGroup icon={Code2} title="Programming languages" items={profile.programmingLanguages} tone="brand" />
          <SkillGroup icon={Layers} title="Frameworks & libraries" items={profile.frameworks} tone="brand" />
          <SkillGroup icon={Wrench} title="Tools & platforms" items={profile.tools} />
          <SkillGroup icon={Lightbulb} title="Technical skills" items={profile.technicalSkills} />
        </div>
      </Panel>

      {profile.suggestedFocusAreas?.length > 0 && (
        <Panel
          icon={Sparkles}
          title="Suggested areas to prepare"
          description="Topics an interviewer is likely to probe, based on your resume."
        >
          <ol className="grid gap-3 md:grid-cols-2">
            {profile.suggestedFocusAreas.map(({ topic, reason }, index) => (
              <li key={topic} className="flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/40 p-4">
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-white text-xs font-semibold text-brand-700 ring-1 ring-brand-200">
                  {index + 1}
                </span>
                <div>
                  <p className="text-sm font-semibold text-ink-900">{topic}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{reason}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Panel icon={FolderGit2} title="Projects">
          {profile.projects?.length ? (
            <div className="space-y-3">
              {profile.projects.map((project) => (
                <div
                  key={project.name}
                  className="rounded-2xl border border-slate-200/80 p-4 transition-colors hover:border-brand-200"
                >
                  <p className="font-semibold text-ink-900">{project.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{project.description}</p>
                  {project.technologies?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {project.technologies.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-medium text-ink-600"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-ink-500">No projects found on this resume.</p>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel icon={Briefcase} title="Experience">
            {profile.experience?.length ? (
              <ol className="space-y-6 border-l-2 border-brand-100 pl-5">
                {profile.experience.map((item) => (
                  <li key={`${item.organization}-${item.role}`} className="relative">
                    <span className="absolute top-1 -left-[27px] size-3 rounded-full border-2 border-white bg-brand-500 ring-2 ring-brand-100" />
                    <p className="text-sm font-semibold text-ink-900">{item.role}</p>
                    <p className="text-sm text-ink-600">
                      {item.organization}
                      {item.duration && <span className="text-ink-500"> · {item.duration}</span>}
                    </p>
                    {item.highlights?.length > 0 && (
                      <ul className="mt-2 space-y-1.5 text-sm text-ink-600">
                        {item.highlights.map((highlight) => (
                          <li key={highlight} className="flex gap-2">
                            <span className="mt-2 size-1 shrink-0 rounded-full bg-ink-500" />
                            {highlight}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-sm text-ink-500">No work experience listed. That is normal for freshers.</p>
            )}
          </Panel>

          <Panel icon={GraduationCap} title="Education">
            {profile.education?.length ? (
              <div className="space-y-4">
                {profile.education.map((item) => (
                  <div key={`${item.institution}-${item.degree}`} className="flex gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <GraduationCap className="size-5 text-ink-600" aria-hidden="true" />
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-ink-900">
                        {item.degree}
                        {item.fieldOfStudy && `, ${item.fieldOfStudy}`}
                      </p>
                      <p className="text-sm text-ink-600">{item.institution}</p>
                      <p className="text-xs text-ink-500">
                        {[item.graduationYear, item.score].filter(Boolean).join(' · ')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-ink-500">No education details found.</p>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}
