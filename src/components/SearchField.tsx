import { useEffect, useId, useRef } from 'react';
import { CloseIcon, SearchIcon } from './Icons';

interface Props {
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  hint?: string;
  inputMode?: 'text' | 'numeric';
  autoFocus?: boolean;
}

/** Kolom pencarian: ikon, input, dan tombol bersihkan dalam satu blok. */
export function SearchField({
  label,
  placeholder,
  value,
  onChange,
  hint,
  inputMode = 'text',
  autoFocus,
}: Props) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (autoFocus) ref.current?.focus();
  }, [autoFocus]);

  return (
    <div className="min-w-0">
      <label htmlFor={id} className="mb-1.5 block text-xs font-medium text-ink-soft">
        {label}
      </label>
      <div className="group relative">
        <SearchIcon className="pointer-events-none absolute top-1/2 left-3 -translate-y-1/2 text-ink-soft" />
        <input
          id={id}
          ref={ref}
          type="text"
          value={value}
          inputMode={inputMode}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
          className="w-full rounded-lg border border-line bg-surface py-2 pr-9 pl-9 text-sm text-ink placeholder:text-ink-soft/70 transition-colors outline-none hover:border-line-strong focus:border-accent"
        />
        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              ref.current?.focus();
            }}
            aria-label={`Bersihkan ${label}`}
            title={`Bersihkan ${label}`}
            className="absolute top-1/2 right-2 -translate-y-1/2 rounded-md p-1 text-ink-soft transition-colors hover:bg-muted hover:text-ink"
          >
            <CloseIcon width={14} height={14} />
          </button>
        )}
      </div>
      {hint && <p className="mt-1 text-[11px] text-ink-soft/80">{hint}</p>}
    </div>
  );
}
