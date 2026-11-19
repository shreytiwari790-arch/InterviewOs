import { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Check, ChevronLeft, ChevronRight, FileQuestion, Pencil, Plus, Trash2 } from 'lucide-react';
import { Alert } from '../../components/ui/Alert';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Dialog } from '../../components/ui/Dialog';
import { EmptyState } from '../../components/ui/EmptyState';
import { SelectField, TagInput, TextAreaField, Toggle } from '../../components/ui/FormControls';
import { PageHeader } from '../../components/ui/PageHeader';
import { Skeleton } from '../../components/ui/Skeleton';
import { TextField } from '../../components/ui/TextField';
import { useApi } from '../../hooks/useApi';
import { adminContentService } from '../../services/adminContentService';
import { cn } from '../../utils/cn';
import { categoryLabels, difficultyLabels, typeLabels } from '../../utils/labels';
import { fieldErrorsFrom } from '../../utils/fieldErrors';

const toOptions = (labels) => Object.entries(labels).map(([value, label]) => ({ value, label }));
const isChoiceType = (type) => type === 'single_choice' || type === 'multi_select';

function questionToForm(question, defaultBlueprint) {
  return {
    blueprint: question?.blueprint?.id ?? question?.blueprint ?? defaultBlueprint ?? '',
    category: question?.category ?? 'mcq',
    topic: question?.topic ?? '',
    difficulty: question?.difficulty ?? 'medium',
    type: question?.type ?? 'single_choice',
    prompt: question?.prompt ?? '',
    codeSnippet: question?.codeSnippet ?? '',
    codeLanguage: question?.codeLanguage ?? '',
    options: question?.options?.length ? question.options.map(({ text }) => text) : ['', '', '', ''],
    correct: question?.options?.length
      ? question.options
          .map((option, index) => (question.correctOptionIds.includes(option.id) ? index : -1))
          .filter((i) => i >= 0)
      : [],
    modelAnswer: question?.modelAnswer ?? '',
    explanation: question?.explanation ?? '',
    expectedKeyConcepts: question?.expectedKeyConcepts ?? [],
    isActive: question?.isActive ?? true,
  };
}

function QuestionFormDialog({ question, blueprintOptions, defaultBlueprint, onClose, onSaved }) {
  const [values, setValues] = useState(() => questionToForm(question, defaultBlueprint));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const set = (field) => (value) => setValues((current) => ({ ...current, [field]: value }));
  const fromEvent = (field) => (event) => set(field)(event.target.value);
  const isChoice = isChoiceType(values.type);

  function toggleCorrect(index) {
    if (values.type === 'single_choice') return set('correct')([index]);
    set('correct')(
      values.correct.includes(index) ? values.correct.filter((i) => i !== index) : [...values.correct, index],
    );
  }

  async function save() {
    setIsSaving(true);
    setErrors({});
    setFormError('');
    const filledOptions = values.options
      .map((text, index) => ({ text: text.trim(), index }))
      .filter((option) => option.text);
    const payload = {
      blueprint: values.blueprint,
      category: values.category,
      topic: values.topic,
      difficulty: values.difficulty,
      type: values.type,
      prompt: values.prompt,
      codeSnippet: values.codeSnippet,
      codeLanguage: values.codeLanguage,
      options: isChoice ? filledOptions.map(({ text }) => ({ text })) : [],
      correctOptionIndexes: isChoice
        ? filledOptions.flatMap((option, newIndex) => (values.correct.includes(option.index) ? [newIndex] : []))
        : [],
      modelAnswer: values.modelAnswer,
      explanation: values.explanation,
      expectedKeyConcepts: values.expectedKeyConcepts,
      isActive: values.isActive,
    };
    try {
      if (question) await adminContentService.updateBankQuestion(question.id, payload);
      else await adminContentService.createBankQuestion(payload);
      onSaved();
    } catch (error) {
      setErrors(fieldErrorsFrom(error));
      setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      isOpen
      size="lg"
      onClose={onClose}
      title={question ? 'Edit question' : 'New bank question'}
      description="Bank questions are mixed into generated interviews (up to 30% per category)."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} isLoading={isSaving}>
            {question ? 'Save question' : 'Add question'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Role track"
            value={values.blueprint}
            onChange={fromEvent('blueprint')}
            error={errors.blueprint}
            options={[{ value: '', label: 'Choose a role track' }, ...blueprintOptions]}
            className="sm:col-span-2"
          />
          <SelectField
            label="Category"
            value={values.category}
            onChange={fromEvent('category')}
            options={toOptions(categoryLabels)}
          />
          <SelectField
            label="Question type"
            value={values.type}
            onChange={fromEvent('type')}
            error={errors.type}
            options={toOptions(typeLabels)}
          />
          <TextField
            label="Topic"
            value={values.topic}
            onChange={fromEvent('topic')}
            error={errors.topic}
            placeholder="e.g. OOP"
          />
          <SelectField
            label="Difficulty"
            value={values.difficulty}
            onChange={fromEvent('difficulty')}
            options={toOptions(difficultyLabels)}
          />
        </div>
        <TextAreaField
          label="Question"
          value={values.prompt}
          onChange={fromEvent('prompt')}
          error={errors.prompt}
          rows={3}
        />
        <div className="grid gap-4 sm:grid-cols-[1fr_160px]">
          <TextAreaField
            label="Code snippet (optional)"
            value={values.codeSnippet}
            onChange={fromEvent('codeSnippet')}
            rows={3}
            className="font-mono"
          />
          <TextField
            label="Language"
            value={values.codeLanguage}
            onChange={fromEvent('codeLanguage')}
            placeholder="java"
          />
        </div>

        {isChoice && (
          <div>
            <p className="mb-2 text-sm font-medium text-ink-700">
              Options{' '}
              <span className="font-normal text-ink-500">
                — click the circle to mark{' '}
                {values.type === 'single_choice' ? 'the correct option' : 'every correct option'}
              </span>
            </p>
            <div className="space-y-2">
              {values.options.map((option, index) => (
                <div key={index} className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleCorrect(index)}
                    aria-label={`Mark option ${index + 1} correct`}
                    aria-pressed={values.correct.includes(index)}
                    className={cn(
                      'flex size-9 shrink-0 items-center justify-center rounded-full border-2 transition-colors',
                      values.correct.includes(index)
                        ? 'border-brand-600 bg-brand-600 text-white'
                        : 'border-slate-300 text-ink-500 hover:border-brand-400',
                    )}
                  >
                    {values.correct.includes(index) ? (
                      <Check className="size-4" strokeWidth={3} />
                    ) : (
                      String.fromCharCode(65 + index)
                    )}
                  </button>
                  <input
                    value={option}
                    onChange={(event) =>
                      set('options')(values.options.map((text, i) => (i === index ? event.target.value : text)))
                    }
                    placeholder={`Option ${String.fromCharCode(65 + index)}`}
                    aria-label={`Option ${index + 1}`}
                    className="h-10 flex-1 rounded-xl border border-slate-200 px-3.5 text-sm focus:border-brand-500 focus:ring-4 focus:ring-brand-100 focus:outline-none"
                  />
                </div>
              ))}
            </div>
            {(errors.options || errors.correctOptionIndexes) && (
              <p className="mt-2 text-xs text-red-600">{errors.options || errors.correctOptionIndexes}</p>
            )}
          </div>
        )}

        <TextAreaField
          label={isChoice ? 'Explanation' : 'Model answer'}
          value={isChoice ? values.explanation : values.modelAnswer}
          onChange={fromEvent(isChoice ? 'explanation' : 'modelAnswer')}
          rows={3}
        />
        {!isChoice && (
          <TextAreaField
            label="Explanation (optional)"
            value={values.explanation}
            onChange={fromEvent('explanation')}
            rows={2}
          />
        )}
        <TagInput
          label="Expected key concepts"
          values={values.expectedKeyConcepts}
          onChange={set('expectedKeyConcepts')}
          hint="Used to evaluate written answers."
        />
        <Toggle
          label="Active"
          description="Inactive questions are never used."
          checked={values.isActive}
          onChange={set('isActive')}
        />
      </div>
    </Dialog>
  );
}

export default function AdminQuestions() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [filters, setFilters] = useState({ blueprint: searchParams.get('blueprint') ?? '', category: '', page: 1 });
  const [editing, setEditing] = useState(null); // null | 'new' | question
  const [pendingDelete, setPendingDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState('');

  const blueprints = useApi((signal) => adminContentService.listAllBlueprints(signal));
  const { data, error, isLoading, reload } = useApi(
    (signal) => adminContentService.listBankQuestions(filters, signal),
    [filters],
  );

  const blueprintOptions = (blueprints.data?.blueprints ?? []).map((b) => ({
    value: b.id,
    label: `${b.company.name} · ${b.roleName}`,
  }));

  function updateFilter(field, value) {
    setFilters((current) => ({ ...current, [field]: value, page: 1 }));
    if (field === 'blueprint') setSearchParams(value ? { blueprint: value } : {});
  }

  async function confirmDelete() {
    setIsDeleting(true);
    try {
      await adminContentService.deleteBankQuestion(pendingDelete.id);
      reload();
    } catch (requestError) {
      setActionError(requestError.message);
    } finally {
      setIsDeleting(false);
      setPendingDelete(null);
    }
  }

  return (
    <>
      <PageHeader
        title="Question bank"
        description="Curated questions per role track. Each interview mixes in up to 30% bank questions per category; the AI writes the rest."
        actions={
          <Button onClick={() => setEditing('new')}>
            <Plus className="size-4" aria-hidden="true" />
            New question
          </Button>
        }
      />

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_220px]">
        <SelectField
          aria-label="Filter by role track"
          value={filters.blueprint}
          onChange={(event) => updateFilter('blueprint', event.target.value)}
          options={[{ value: '', label: 'All role tracks' }, ...blueprintOptions]}
        />
        <SelectField
          aria-label="Filter by category"
          value={filters.category}
          onChange={(event) => updateFilter('category', event.target.value)}
          options={[{ value: '', label: 'All categories' }, ...toOptions(categoryLabels)]}
        />
      </div>

      {(error || actionError) && (
        <Alert tone="error" className="mb-4">
          {error?.message || actionError}
        </Alert>
      )}

      {isLoading && !data ? (
        <div className="space-y-3">
          {[0, 1, 2].map((key) => (
            <Skeleton key={key} className="h-24 rounded-3xl" />
          ))}
        </div>
      ) : data?.questions.length ? (
        <ul className="space-y-3">
          {data.questions.map((question) => (
            <li
              key={question.id}
              className={cn(
                'rounded-3xl border bg-white p-5',
                question.isActive ? 'border-slate-200' : 'border-dashed border-slate-300 opacity-70',
              )}
            >
              <div className="flex items-start gap-4">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-2xl bg-brand-50">
                  <FileQuestion className="size-5 text-brand-600" aria-hidden="true" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-ink-900">{question.prompt}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    <Badge tone="brand">{categoryLabels[question.category]}</Badge>
                    <Badge>{typeLabels[question.type]}</Badge>
                    <Badge>{question.topic}</Badge>
                    <Badge>{difficultyLabels[question.difficulty]}</Badge>
                    {!question.isActive && <Badge tone="warning">Inactive</Badge>}
                  </div>
                  {question.blueprint?.company && (
                    <p className="mt-2 text-xs text-ink-500">
                      {question.blueprint.company.name} · {question.blueprint.roleName}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button variant="ghost" size="sm" onClick={() => setEditing(question)} aria-label="Edit question">
                    <Pencil className="size-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setPendingDelete(question)}
                    className="text-red-600 hover:bg-red-50"
                    aria-label="Delete question"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <Card>
          <EmptyState
            icon={FileQuestion}
            title="No questions yet"
            description="Add curated questions so every interview includes some you have reviewed."
          />
        </Card>
      )}

      {data?.pagination.totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-ink-500">
          <span>
            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} questions
          </span>
          <div className="flex gap-1">
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page <= 1}
              onClick={() => setFilters((c) => ({ ...c, page: c.page - 1 }))}
              aria-label="Previous page"
            >
              <ChevronLeft className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={filters.page >= data.pagination.totalPages}
              onClick={() => setFilters((c) => ({ ...c, page: c.page + 1 }))}
              aria-label="Next page"
            >
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </div>
      )}

      {editing && (
        <QuestionFormDialog
          key={editing === 'new' ? 'new' : editing.id}
          question={editing === 'new' ? null : editing}
          defaultBlueprint={filters.blueprint}
          blueprintOptions={blueprintOptions}
          onClose={() => setEditing(null)}
          onSaved={() => {
            setEditing(null);
            reload();
          }}
        />
      )}

      <ConfirmDialog
        isOpen={Boolean(pendingDelete)}
        title="Delete this question?"
        description="Interviews that already used it keep their copy."
        confirmLabel="Delete"
        tone="danger"
        isLoading={isDeleting}
        onConfirm={confirmDelete}
        onClose={() => !isDeleting && setPendingDelete(null)}
      />
    </>
  );
}
