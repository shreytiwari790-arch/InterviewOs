import { Briefcase, Code2, FolderGit2, GraduationCap, Info, Lightbulb, Wrench } from 'lucide-react';
import { Card, CardBody, CardHeader } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { experienceLabels } from '../../utils/labels';

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
    <div>
      <p className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink-900">
        <Icon className="size-4 text-brand-600" aria-hidden="true" />
        {title}
      </p>
      <Chips items={items} tone={tone} />
    </div>
  );
}

export function ResumeAnalysis({ profile }) {
  return (
    <div className="space-y-6">
      <Card className="overflow-hidden">
        <div className="bg-gradient-to-br from-brand-50 to-white px-6 py-6 sm:px-8">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-lg font-semibold">Profile summary</h2>
            {profile.estimatedExperienceLevel && (
              <Badge tone="brand">{experienceLabels[profile.estimatedExperienceLevel]}</Badge>
            )}
          </div>
          <p className="mt-3 max-w-3xl leading-relaxed text-ink-600">{profile.summary}</p>
          <p className="mt-4 flex items-center gap-1.5 text-xs text-ink-500">
            <Info className="size-3.5" aria-hidden="true" />
            Extracted by AI from your resume. These details are your own claims and have not been verified.
          </p>
        </div>
      </Card>

      <Card>
        <CardHeader title="Skills" description="Grouped from your resume. Interview questions draw on these." />
        <CardBody className="grid gap-7 sm:grid-cols-2">
          <SkillGroup icon={Code2} title="Programming languages" items={profile.programmingLanguages} tone="brand" />
          <SkillGroup icon={FolderGit2} title="Frameworks & libraries" items={profile.frameworks} tone="brand" />
          <SkillGroup icon={Wrench} title="Tools & platforms" items={profile.tools} />
          <SkillGroup icon={Lightbulb} title="Technical skills" items={profile.technicalSkills} />
        </CardBody>
      </Card>

      {profile.suggestedFocusAreas?.length > 0 && (
        <Card>
          <CardHeader
            title="Suggested areas to prepare"
            description="Topics an interviewer is likely to probe, based on your resume."
          />
          <CardBody className="grid gap-3 sm:grid-cols-2">
            {profile.suggestedFocusAreas.map(({ topic, reason }) => (
              <div key={topic} className="rounded-2xl border border-brand-100 bg-brand-50/50 p-4">
                <p className="text-sm font-semibold text-brand-800">{topic}</p>
                <p className="mt-1 text-sm text-ink-600">{reason}</p>
              </div>
            ))}
          </CardBody>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 lg:items-start">
        <Card>
          <CardHeader title="Projects" />
          <CardBody className="space-y-4">
            {profile.projects?.length ? (
              profile.projects.map((project) => (
                <div key={project.name} className="rounded-2xl border border-slate-200 p-4">
                  <p className="font-semibold text-ink-900">{project.name}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink-600">{project.description}</p>
                  {project.technologies?.length > 0 && (
                    <p className="mt-3 text-xs font-medium text-brand-700">{project.technologies.join(' · ')}</p>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-ink-500">No projects found on this resume.</p>
            )}
          </CardBody>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader title="Experience" />
            <CardBody>
              {profile.experience?.length ? (
                <ol className="space-y-5 border-l-2 border-brand-100 pl-5">
                  {profile.experience.map((item) => (
                    <li key={`${item.organization}-${item.role}`} className="relative">
                      <span className="absolute top-1.5 -left-[27px] size-3 rounded-full border-2 border-white bg-brand-500" />
                      <p className="flex items-center gap-2 text-sm font-semibold text-ink-900">
                        <Briefcase className="size-4 text-ink-500" aria-hidden="true" />
                        {item.role} · {item.organization}
                      </p>
                      {item.duration && <p className="mt-0.5 text-xs text-ink-500">{item.duration}</p>}
                      {item.highlights?.length > 0 && (
                        <ul className="mt-2 list-disc space-y-1 pl-4 text-sm text-ink-600">
                          {item.highlights.map((highlight) => (
                            <li key={highlight}>{highlight}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="text-sm text-ink-500">No work experience listed. That is normal for freshers.</p>
              )}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Education" />
            <CardBody className="space-y-4">
              {profile.education?.length ? (
                profile.education.map((item) => (
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
                ))
              ) : (
                <p className="text-sm text-ink-500">No education details found.</p>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
