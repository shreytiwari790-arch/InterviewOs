import { useState } from 'react';
import { adminContentService } from '../../services/adminContentService';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Dialog } from '../ui/Dialog';
import { FieldShell, TextAreaField, Toggle } from '../ui/FormControls';
import { TextField } from '../ui/TextField';
import { fieldErrorsFrom } from '../../utils/fieldErrors';

const emptyCompany = { name: '', slug: '', industry: '', description: '', accentColor: '#0a9a78', isActive: true };

/** Create or edit a company. Mount with a `key` so the form resets for each company. */
export function CompanyFormDialog({ company, isOpen, onClose, onSaved }) {
  const [values, setValues] = useState(() => ({ ...emptyCompany, ...company }));
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const set = (field) => (event) => setValues((current) => ({ ...current, [field]: event.target.value }));

  async function save() {
    setIsSaving(true);
    setErrors({});
    setFormError('');
    const payload = {
      name: values.name,
      industry: values.industry,
      description: values.description,
      accentColor: values.accentColor,
      isActive: values.isActive,
      ...(values.slug && { slug: values.slug }),
    };
    try {
      const { company: saved } = company?.id
        ? await adminContentService.updateCompany(company.id, payload)
        : await adminContentService.createCompany(payload);
      onSaved(saved);
    } catch (error) {
      setErrors(fieldErrorsFrom(error));
      if (!error.details?.length) setFormError(error.message);
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title={company?.id ? `Edit ${company.name}` : 'New company'}
      description="Companies group the role tracks candidates can choose from."
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={save} isLoading={isSaving}>
            {company?.id ? 'Save changes' : 'Create company'}
          </Button>
        </>
      }
    >
      <div className="space-y-5">
        {formError && <Alert tone="error">{formError}</Alert>}
        <div className="grid gap-5 sm:grid-cols-2">
          <TextField
            label="Name"
            value={values.name}
            onChange={set('name')}
            error={errors.name}
            placeholder="e.g. Wipro"
          />
          <TextField
            label="Industry"
            value={values.industry}
            onChange={set('industry')}
            error={errors.industry}
            placeholder="e.g. IT services"
          />
          <TextField
            label="Slug"
            value={values.slug}
            onChange={set('slug')}
            error={errors.slug}
            hint="Used in URLs. Leave empty to generate from the name."
          />
          <FieldShell label="Accent colour" error={errors.accentColor}>
            <div className="flex h-11 items-center gap-3 rounded-xl border border-slate-200 px-3">
              <input
                type="color"
                value={values.accentColor}
                onChange={set('accentColor')}
                className="size-7 cursor-pointer rounded border-0 bg-transparent"
                aria-label="Accent colour"
              />
              <span className="text-sm text-ink-600 uppercase tabular-nums">{values.accentColor}</span>
            </div>
          </FieldShell>
        </div>
        <TextAreaField
          label="Description"
          value={values.description}
          onChange={set('description')}
          error={errors.description}
          rows={3}
          placeholder="Shown to candidates when choosing a company"
        />
        <Toggle
          label="Visible to candidates"
          description="Inactive companies are hidden from the interview setup."
          checked={values.isActive}
          onChange={(isActive) => setValues((current) => ({ ...current, isActive }))}
        />
      </div>
    </Dialog>
  );
}
