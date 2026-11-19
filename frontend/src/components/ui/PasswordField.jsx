import { useState } from 'react';
import { Eye, EyeOff, LockKeyhole } from 'lucide-react';
import { TextField } from './TextField';

export function PasswordField(props) {
  const [isVisible, setIsVisible] = useState(false);
  const ToggleIcon = isVisible ? EyeOff : Eye;

  return (
    <TextField
      type={isVisible ? 'text' : 'password'}
      icon={LockKeyhole}
      trailing={
        <button
          type="button"
          onClick={() => setIsVisible((visible) => !visible)}
          className="rounded-md p-1.5 text-slate-400 transition-colors hover:text-slate-600 focus-visible:outline-2 focus-visible:outline-brand-500"
          aria-label={isVisible ? 'Hide password' : 'Show password'}
        >
          <ToggleIcon className="size-4" aria-hidden="true" />
        </button>
      }
      {...props}
    />
  );
}
