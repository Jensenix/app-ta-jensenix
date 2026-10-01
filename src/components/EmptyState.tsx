import { InboxIcon, ResetIcon } from './Icons';

interface Props {
  activeCount: number;
  onReset: () => void;
  total: number;
}

export function EmptyState({ activeCount, onReset, total }: Props) {
  const filtered = activeCount > 0;

  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-16 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted text-ink-soft">
        <InboxIcon width={20} height={20} />
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">
          {filtered ? 'Tidak ada data yang cocok' : 'Belum ada data'}
        </p>
        <p className="mx-auto mt-1 max-w-sm text-xs leading-relaxed text-ink-soft">
          {filtered
            ? 'Coba longgarkan kata kunci atau pilih jenis jalur/status yang lebih banyak.'
            : `File JSON yang dimuat belum berisi data tugas akhir (total ${total} baris terbaca).`}
        </p>
      </div>
      {filtered && (
        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink transition-colors hover:border-line-strong"
        >
          <ResetIcon width={13} height={13} />
          Reset semua filter
        </button>
      )}
    </div>
  );
}
