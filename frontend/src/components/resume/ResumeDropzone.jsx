import { useRef, useState } from 'react';
import { FileUp, Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

const ACCEPTED_EXTENSIONS = ['.pdf', '.docx'];
const MAX_BYTES = 5 * 1024 * 1024;

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
          'group flex w-full flex-col items-center justify-center rounded-3xl border-2 border-dashed text-center transition-all duration-200',
          compact ? 'px-6 py-8' : 'px-6 py-16 sm:py-20',
          isDragging
            ? 'border-brand-500 bg-brand-50'
            : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50/40',
          isUploading && 'cursor-wait opacity-80',
        )}
      >
        <span
          className={cn(
            'flex items-center justify-center rounded-2xl bg-brand-50 transition-transform duration-200 group-hover:scale-105',
            compact ? 'size-12' : 'size-16',
          )}
        >
          {isUploading ? (
            <Loader2 className="size-7 animate-spin text-brand-600" aria-hidden="true" />
          ) : (
            <FileUp className={cn('text-brand-600', compact ? 'size-6' : 'size-7')} aria-hidden="true" />
          )}
        </span>
        <p className={cn('font-semibold text-ink-900', compact ? 'mt-4 text-sm' : 'mt-6 text-lg')}>
          {isUploading ? 'Reading your resume…' : 'Drop your resume here or click to browse'}
        </p>
        <p className="mt-1.5 text-sm text-ink-500">
          {isUploading
            ? 'Scanned or image PDFs take a few extra seconds.'
            : 'PDF or DOCX, up to 5 MB. Scanned PDFs work too.'}
        </p>
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
