import { useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Info, Plus, Trash2 } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Button } from '../../components/ui/Button';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import {
  FieldShell,
  NumberField,
  SelectField,
  TagInput,
  TextAreaField,
  Toggle,
} from '../../components/ui/FormControls';
import { Skeleton } from '../../components/ui/Skeleton';
import { TextField } from '../../components/ui/TextField';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { cn } from '../../utils/cn';
import { categoryLabels, difficultyLabels, experienceLabels, typeLabels } from '../../utils/labels';
import { adminCompanyPath } from '../../utils/paths';
import { fieldErrorsFrom } from '../../utils/fieldErrors';

const RELIABILITY_OPTIONS = ['official', 'high', 'medium', 'low', 'unverified'].map((value) => ({
  value,
  label: value[0].toUpperCase() + value.slice(1),
}));

const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));

function initialValues(blueprint) {
  const weights = Object.fromEntries(Object.keys(categoryLabels).map((category) => [category, 0]));
  for (const { category, weight } of blueprint?.categoryDistribution ?? []) weights[category] = weight;
  return {
    roleName: blueprint?.roleName ?? '',
    track: blueprint?.track ?? '',
    region: blueprint?.region ?? 'India',
    slug: blueprint?.slug ?? '',
    summary: blueprint?.summary ?? '',
    experienceLevel: blueprint?.experienceLevel ?? 'fresher',
    difficulty: blueprint?.difficulty ?? 'medium',
    durationMinutes: blueprint?.durationMinutes ?? 45,
    totalQuestions: blueprint?.totalQuestions ?? 15,
    weights: blueprint ? weights : { resume_project: 15, mcq: 30, programming: 20, core_cs: 20, scenario: 5, hr: 10 },
    topics: blueprint?.topics ?? [],
    questionTypes: blueprint?.questionTypes ?? Object.keys(typeLabels),
    focusNotes: blueprint?.focusNotes ?? '',
    sources: blueprint?.sources?.length ? blueprint.sources : [{ label: '', url: '', reliability: 'unverified' }],
    lastVerifiedAt: blueprint?.lastVerifiedAt ? blueprint.lastVerifiedAt.slice(0, 10) : '',
    isActive: blueprint?.isActive ?? true,
  };
}

function EditorForm({ companyId, company, blueprint }) {
  const navigate = useNavigate();
  const [values, setValues] = useState(() => initialValues(blueprint));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const set = (field) => (value) => setValues((current) => ({ ...current, [field]: value }));
  const setFromEvent = (field) => (event) => set(field)(event.target.value);
  const totalWeight = Object.values(values.weights).reduce((sum, weight) => sum + Number(weight || 0), 0);

  function updateSource(index, field, value) {
    set('sources')(values.sources.map((source, i) => (i === index ? { ...source, [field]: value } : source)));
  }

  async function save(event) {
    event.preventDefault();
    setIsSaving(true);
    setErrors({});
    setFormError('');
    const payload = {
      roleName: values.roleName,
      track: values.track,
      region: values.region,
      summary: values.summary,
      experienceLevel: values.experienceLevel,
      difficulty: values.difficulty,
      durationMinutes: Number(values.durationMinutes),
      totalQuestions: Number(values.totalQuestions),
      categoryDistribution: Object.entries(values.weights)
        .map(([category, weight]) => ({ category, weight: Number(weight || 0) }))
        .filter((entry) => entry.weight > 0),
      topics: values.topics,
      questionTypes: values.questionTypes,
      focusNotes: values.focusNotes,
      sources: values.sources.filter((source) => source.label.trim() || source.url.trim()),
      lastVerifiedAt: values.lastVerifiedAt || null,
      isActive: values.isActive,
      ...(values.slug && { slug: values.slug }),
    };
    try {
      if (blueprint) await adminContentService.updateBlueprint(blueprint.id, payload);
      else await adminContentService.createBlueprint({ ...payload, company: companyId });
      navigate(adminCompanyPath(companyId));
    } catch (error) {
      setErrors(fieldErrorsFrom(error));
      setFormError(error.message);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form onSubmit={save} noValidate>
      <Link
        to={adminCompanyPath(companyId)}
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-ink-600 hover:text-ink-900"
      >
        <ArrowLeft className="size-4" aria-hidden="true" />
        {company.name}
      </Link>
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {blueprint ? `Edit ${blueprint.roleName}` : 'New role track'}
          </h1>
          <p className="mt-1.5 text-sm text-ink-500">
            Changes apply to new interviews only. Past interviews keep the pattern they used.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => navigate(adminCompanyPath(companyId))}>
            Cancel
          </Button>
          <Button type="submit" isLoading={isSaving}>
            {blueprint ? 'Save changes' : 'Create role track'}
          </Button>
        </div>
      </div>

      {formError && (
        <Alert tone="error" className="mb-6">
          {formError}
        </Alert>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_340px] lg:items-start">
        <div className="space-y-6">
          <Card>
            <CardHeader title="Basics" />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <TextField
                label="Role name"
                value={values.roleName}
                onChange={setFromEvent('roleName')}
                error={errors.roleName}
                placeholder="e.g. Digital"
              />
              <TextField
                label="Hiring track"
                value={values.track}
                onChange={setFromEvent('track')}
                error={errors.track}
                placeholder="e.g. Campus / NQT"
              />
              <TextField label="Region" value={values.region} onChange={setFromEvent('region')} error={errors.region} />
              <TextField
                label="Slug"
                value={values.slug}
                onChange={setFromEvent('slug')}
                error={errors.slug}
                hint="Leave empty to generate automatically."
              />
              <TextAreaField
                className="sm:col-span-2"
                label="Summary"
                value={values.summary}
                onChange={setFromEvent('summary')}
                error={errors.summary}
                rows={2}
                placeholder="One or two sentences shown to candidates"
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Interview settings"
              description="Defaults candidates start with. They can adjust them before generating."
            />
            <CardBody className="grid gap-5 sm:grid-cols-2">
              <SelectField
                label="Experience level"
                value={values.experienceLevel}
                onChange={setFromEvent('experienceLevel')}
                options={toOptions(experienceLabels)}
              />
              <SelectField
                label="Difficulty"
                value={values.difficulty}
                onChange={setFromEvent('difficulty')}
                options={toOptions(difficultyLabels)}
              />
              <NumberField
                label="Duration (minutes)"
                min={10}
                max={180}
                value={values.durationMinutes}
                onChange={setFromEvent('durationMinutes')}
                error={errors.durationMinutes}
              />
              <NumberField
                label="Number of questions"
                min={5}
                max={40}
                value={values.totalQuestions}
                onChange={setFromEvent('totalQuestions')}
                error={errors.totalQuestions}
              />
            </CardBody>
          </Card>

          <Card>
            <CardHeader
              title="Question mix"
              description="Relative weights. They are scaled to however many questions a candidate chooses."
            />
            <CardBody className="space-y-4">
              {errors.categoryDistribution && <Alert tone="error">{errors.categoryDistribution}</Alert>}
              {Object.entries(categoryLabels).map(([category, label]) => {
                const weight = Number(values.weights[category] || 0);
                const share = totalWeight ? Math.round((weight / totalWeight) * 100) : 0;
                return (
                  <div
                    key={category}
                    className="grid grid-cols-[1fr_auto] items-center gap-x-4 gap-y-1.5 sm:grid-cols-[180px_1fr_70px]"
                  >
                    <span className="text-sm font-medium text-ink-700">{label}</span>
                    <input
                      type="range"
                      min={0}
                      max={60}
                      value={weight}
                      onChange={(event) =>
                        set('weights')({ ...values.weights, [category]: Number(event.target.value) })
                      }
                      className="order-3 col-span-2 w-full accent-brand-600 sm:order-none sm:col-span-1"
                      aria-label={`${label} weight`}
                    />
                    <span
                      className={cn(
                        'text-right text-sm font-semibold tabular-nums',
                        weight ? 'text-ink-900' : 'text-ink-500',
                      )}
                    >
                      {share}%
                    </span>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader title="Content" />
            <CardBody className="space-y-5">
              <TagInput
                label="Topics"
                values={values.topics}
                onChange={set('topics')}
                error={errors.topics}
                hint="The AI focuses questions on these topics."
              />
              <FieldShell label="Allowed question types" error={errors.questionTypes}>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(typeLabels).map(([type, label]) => {
                    const isChecked = values.questionTypes.includes(type);
                    return (
                      <button
                        key={type}
                        type="button"
                        aria-pressed={isChecked}
                        onClick={() =>
                          set('questionTypes')(
                            isChecked
                              ? values.questionTypes.filter((t) => t !== type)
                              : [...values.questionTypes, type],
                          )
                        }
                        className={cn(
                          'rounded-full border px-4 py-2 text-sm font-medium transition-colors',
                          isChecked
                            ? 'border-ink-900 bg-ink-900 text-white'
                            : 'border-slate-200 text-ink-700 hover:border-slate-300',
                        )}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </FieldShell>
              <TextAreaField
                label="Focus notes for the AI"
                value={values.focusNotes}
                onChange={setFromEvent('focusNotes')}
                error={errors.focusNotes}
                rows={3}
                placeholder="e.g. Behavioural questions should map to Amazon Leadership Principles."
              />
            </CardBody>
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-8">
          <Card>
            <CardHeader title="Sources & verification" />
            <CardBody className="space-y-4">
              {values.sources.map((source, index) => (
                <div key={index} className="space-y-2 rounded-2xl border border-slate-200 p-3">
                  <div className="flex gap-2">
                    <input
                      value={source.label}
                      onChange={(event) => updateSource(index, 'label', event.target.value)}
                      placeholder="Label"
                      aria-label="Source label"
                      className="h-9 min-w-0 flex-1 rounded-lg border border-slate-200 px-3 text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => set('sources')(values.sources.filter((_, i) => i !== index))}
                      className="rounded-lg p-2 text-ink-500 hover:bg-red-50 hover:text-red-600"
                      aria-label="Remove source"
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </button>
                  </div>
                  <input
                    value={source.url}
                    onChange={(event) => updateSource(index, 'url', event.target.value)}
                    placeholder="https://…"
                    aria-label="Source URL"
                    className="h-9 w-full rounded-lg border border-slate-200 px-3 text-sm"
                  />
                  <select
                    value={source.reliability}
                    onChange={(event) => updateSource(index, 'reliability', event.target.value)}
                    aria-label="Reliability"
                    className="h-9 w-full rounded-lg border border-slate-200 px-2 text-sm"
                  >
                    {RELIABILITY_OPTIONS.map(({ value, label }) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
              {errors.sources && <p className="text-xs text-red-600">{errors.sources}</p>}
              <Button
                variant="secondary"
                size="sm"
                onClick={() => set('sources')([...values.sources, { label: '', url: '', reliability: 'unverified' }])}
              >
                <Plus className="size-4" aria-hidden="true" />
                Add source
              </Button>
              <FieldShell label="Last verified" hint="Set when you have checked this profile against the sources.">
                <input
                  type="date"
                  value={values.lastVerifiedAt}
                  onChange={setFromEvent('lastVerifiedAt')}
                  className="h-11 w-full rounded-xl border border-slate-200 px-3.5 text-sm"
                />
              </FieldShell>
            </CardBody>
          </Card>
          <Card className="p-5">
            <Toggle
              label="Active"
              description="Inactive tracks are hidden from candidates."
              checked={values.isActive}
              onChange={set('isActive')}
            />
          </Card>
          <p className="flex gap-2 text-xs leading-relaxed text-ink-500">
            <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
            Candidates see these as preparation profiles, not official interview patterns.
          </p>
        </aside>
      </div>
    </form>
  );
}

export default function BlueprintEditor() {
  const { companyId, blueprintId } = useParams();
  const { data, error } = useApi((signal) => adminContentService.listCompanyBlueprints(companyId, signal), [companyId]);

  if (error) return <Alert tone="error">{error.message}</Alert>;
  if (!data) return <Skeleton className="h-96 rounded-3xl" />;

  const blueprint = blueprintId === 'new' ? null : data.blueprints.find((item) => item.id === blueprintId);
  if (blueprintId !== 'new' && !blueprint) return <Alert tone="error">Role track not found.</Alert>;

  return <EditorForm key={blueprintId} companyId={companyId} company={data.company} blueprint={blueprint} />;
}
