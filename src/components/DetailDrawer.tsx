import { useEffect } from 'react';
import type { TaRow } from '../types';
import { statusTone } from '../lib/present';
import { Badge } from './Badge';
import { CloseIcon } from './Icons';

interface Props {
  row: TaRow | null;
  onClose: () => void;
}

const FIELDS: Array<{ label: string; value: (row: TaRow) => string; mono?: boolean }> = [
  { label: 'NIM', value: (row) => row.nim, mono: true },
  { label: 'Nama', value: (row) => row.nama },
  { label: 'Judul Tugas Akhir Program Studi', value: (row) => row.judul_tugas_akhir_program_studi },
  { label: 'Judul Indonesia', value: (row) => row.judul_indonesia },
  { label: 'Judul Inggris', value: (row) => row.judul_inggris },
];

/** Panel detail: bottom sheet di mobile, slide-over di desktop. */
export function DetailDrawer({ row, onClose }: Props) {
  useEffect(() => {
    if (!row) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [row, onClose]);

  if (!row) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label="Detail data tugas akhir">
      <button
        type="button"
        aria-label="Tutup detail"
        onClick={onClose}
        className="animate-overlay absolute inset-0 bg-ink/35 backdrop-blur-[2px]"
      />

      <div
        className="animate-drawer absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-2xl border-t border-line bg-surface shadow-pop md:inset-y-0 md:left-auto md:max-h-none md:w-[30rem] md:max-w-[30rem] md:rounded-none md:rounded-l-2xl md:border-t-0 md:border-l"
        style={{ scrollbarWidth: 'thin' }}
      >
        <header className="sticky top-0 z-10 flex items-start justify-between gap-3 border-b border-line bg-surface/95 px-4 py-3.5 backdrop-blur">
          <div className="min-w-0">
            <p className="text-[11px] font-medium tracking-wide text-ink-soft uppercase">
              Detail mahasiswa
            </p>
            <h2 className="mt-0.5 truncate text-sm font-semibold text-ink">{row.nama}</h2>
            <p className="nums mt-0.5 text-xs text-ink-soft">NIM {row.nim}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup"
            className="-mt-1 -mr-1 shrink-0 rounded-lg p-2 text-ink-soft transition-colors hover:bg-muted hover:text-ink"
          >
            <CloseIcon width={16} height={16} />
          </button>
        </header>

        <div className="px-4 py-4">
          <div className="mb-4 flex flex-wrap gap-2">
            <Badge tone={statusTone(row.status)}>{row.status}</Badge>
            <Badge tone="neutral">{row.jenis_jalur}</Badge>
          </div>

          <dl className="space-y-4">
            {FIELDS.map((field) => {
              const value = field.value(row);
              return (
                <div key={field.label}>
                  <dt className="text-[11px] font-semibold tracking-wide text-ink-soft uppercase">
                    {field.label}
                  </dt>
                  <dd
                    className={`mt-1 text-sm leading-relaxed break-words ${
                      value ? 'text-ink' : 'text-ink-soft/70 italic'
                    } ${field.mono ? 'nums font-medium' : ''}`}
                  >
                    {value || 'tidak diisi'}
                  </dd>
                </div>
              );
            })}
          </dl>

          <CopyButton row={row} />
        </div>
      </div>
    </div>
  );
}

function CopyButton({ row }: { row: TaRow }) {
  const text = [
    `NIM: ${row.nim}`,
    `Nama: ${row.nama}`,
    `Judul: ${row.judul_tugas_akhir_program_studi}`,
    `Jalur: ${row.jenis_jalur}`,
    `Status: ${row.status}`,
  ].join('\n');

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* clipboard tidak tersedia, abaikan saja */
    }
  };

  return (
    <button
      type="button"
      onClick={copy}
      className="mt-5 w-full rounded-lg border border-line bg-muted/60 py-2 text-xs font-medium text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
    >
      Salin ringkasan
    </button>
  );
}
