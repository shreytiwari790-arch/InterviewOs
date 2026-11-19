import { useRef, useState } from 'react';
import { FileUp, Loader2, ShieldCheck } from 'lucide-react';
import { cn } from '../../utils/cn';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_BYTES = 5 * 1024 * 1024;

function FormatChip({ children, isDark }) {
  return (
    <span
      className={cn(
        'rounded-md px-2 py-0.5 text-[11px] font-semibold tracking-wide',
        isDark ? 'bg-white text-ink-700 ring-1 ring-slate-200' : 'bg-white/80 text-ink-600 ring-1 ring-slate-200',
      )}
    >
      {children}
    </span>
  );
}

export function ResumeDropzone({ onFile, isUploading, compact = false }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  function handleFiles(files) {
    const file = files?.[0];
    if (!file) return;
    const extension = file.name.slice(file.name.lastIndexOf('.')).toLowerCase();
    if (!ACCEPTED_EXTENSIONS.includes(extension)) return setLocalError('Upload a PDF or DOCX file.');
    if (file.size > MAX_BYTES) return setLocalError('This file is larger than 5 MB.');
    setLocalError('');
    onFile(file);
  }

  return (
    <div>
      <button
        type="button"
        disabled={isUploading}
        onClick={() => inputRef.current?.click()}
        onDragOver={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          setIsDragging(false);
          handleFiles(event.dataTransfer.files);
        }}
        className={cn(
          'group relative flex w-full flex-col items-center justify-center overflow-hidden rounded-3xl border-2 border-dashed text-center transition-all duration-200',
          'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500',
          compact ? 'px-5 py-7' : 'px-6 py-14 sm:py-16',
          isDragging
            ? 'scale-[1.01] border-brand-500 bg-brand-50'
            : 'border-brand-200 bg-gradient-to-b from-brand-50/70 to-white hover:border-brand-400',
          isUploading && 'cursor-wait',
        )}
      >
        {isUploading && (
          <span className="absolute inset-x-0 top-0 h-1 overflow-hidden bg-brand-100" aria-hidden="true">
            <span className="block h-full w-1/3 animate-[upload-bar_1.2s_ease-in-out_infinite] rounded-full bg-brand-500" />
          </span>
        )}

        <span
          className={cn(
            'relative flex items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 to-brand-700 shadow-lg shadow-brand-700/25 transition-transform duration-200 group-hover:-translate-y-0.5',
            compact ? 'size-12' : 'size-16',
          )}
        >
          {isUploading ? (
            <Loader2 className={cn('animate-spin text-white', compact ? 'size-5' : 'size-7')} aria-hidden="true" />
          ) : (
            <FileUp className={cn('text-white', compact ? 'size-5' : 'size-7')} aria-hidden="true" />
          )}
        </span>

        <p className={cn('font-semibold text-ink-900', compact ? 'mt-4 text-sm' : 'mt-6 text-lg')}>
          {isUploading
            ? 'Reading your resume…'
            : isDragging
              ? 'Drop it here'
              : compact
                ? 'Upload a new version'
                : 'Drag and drop your resume'}
        </p>
        <p className={cn('text-ink-500', compact ? 'mt-1 text-xs' : 'mt-1.5 text-sm')}>
          {isUploading ? (
            'Scanned or image PDFs take a few extra seconds.'
          ) : (
            <>
              or{' '}
              <span className="font-semibold text-brand-700 underline-offset-2 group-hover:underline">
                browse files
              </span>{' '}
              from your computer
            </>
          )}
        </p>

        {!isUploading && (
          <span className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
            <FormatChip isDark={isDragging}>PDF</FormatChip>
            <FormatChip isDark={isDragging}>DOCX</FormatChip>
            <span className="text-[11px] text-ink-500">
              {compact ? 'up to 5 MB' : 'up to 5 MB · scanned PDFs work too'}
            </span>
          </span>
        )}

        {!compact && !isUploading && (
          <span className="mt-6 inline-flex items-center gap-1.5 text-xs text-ink-500">
            <ShieldCheck className="size-3.5 text-brand-600" aria-hidden="true" />
            Only the extracted text is stored. Never shared with employers.
          </span>
        )}
      </button>
      <input
        ref={inputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="sr-only"
        onChange={(event) => {
          handleFiles(event.target.files);
          event.target.value = '';
        }}
      />
      {localError && <p className="mt-3 text-sm text-red-600">{localError}</p>}
    </div>
  );
}
