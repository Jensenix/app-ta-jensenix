import type { Facet, Filters } from '../types';
import { nf } from '../lib/present';
import { SearchField } from './SearchField';
import { ResetIcon } from './Icons';

interface Props {
  filters: Filters;
  jalurFacets: Facet[];
  statusFacets: Facet[];
  matched: number;
  total: number;
  activeCount: number;
  onChange: (next: Partial<Filters>) => void;
  onToggle: (key: 'jenisJalur' | 'status', value: string) => void;
  onReset: () => void;
}

export function FilterPanel({
  filters,
  jalurFacets,
  statusFacets,
  matched,
  total,
  activeCount,
  onChange,
  onToggle,
  onReset,
}: Props) {
  return (
    <section
      aria-label="Filter data"
      className="rounded-xl border border-line bg-surface p-3 shadow-panel sm:p-4"
    >
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-ink">Filter</h2>
        <div className="flex items-center gap-2">
          <span className="nums text-xs text-ink-soft">
            {activeCount > 0 ? (
              <>
                <span className="font-semibold text-accent">{nf.format(matched)}</span> dari{' '}
                {nf.format(total)} data
              </>
            ) : (
              <>
                <span className="font-semibold text-ink">{nf.format(total)}</span> data
              </>
            )}
          </span>
          <button
            type="button"
            onClick={onReset}
            disabled={activeCount === 0}
            className="inline-flex items-center gap-1.5 rounded-lg border border-line px-2.5 py-1 text-xs font-medium text-ink-soft transition-colors enabled:hover:border-line-strong enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
          >
            <ResetIcon width={13} height={13} />
            Reset
            {activeCount > 0 && (
              <span className="nums rounded bg-muted px-1 text-[10px] font-semibold">
                {activeCount}
              </span>
            )}
          </button>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <SearchField
          label="Judul tugas akhir"
          placeholder="mis. mobile banking"
          value={filters.judul}
          onChange={(judul) => onChange({ judul })}
        />
        <SearchField
          label="Nama mahasiswa"
          placeholder="mis. teresia"
          value={filters.nama}
          onChange={(nama) => onChange({ nama })}
        />
        <div className="sm:col-span-2 lg:col-span-1">
          <SearchField
            label="NIM"
            placeholder="mis. 23111"
            inputMode="numeric"
            hint="Cari sebagian digit, tanpa perlu NIM lengkap."
            value={filters.nim}
            onChange={(nim) => onChange({ nim })}
          />
        </div>
      </div>

      <div className="mt-4 grid gap-3 border-t border-line pt-3.5 lg:grid-cols-2">
        <ChipGroup
          title="Jenis jalur"
          hint={filters.jenisJalur.length > 0 ? `${filters.jenisJalur.length} dipilih` : 'Semua jenis'}
          options={jalurFacets}
          selected={filters.jenisJalur}
          onToggle={(value) => onToggle('jenisJalur', value)}
        />
        <ChipGroup
          title="Status"
          hint={filters.status.length > 0 ? `${filters.status.length} dipilih` : 'Semua status'}
          options={statusFacets}
          selected={filters.status}
          onToggle={(value) => onToggle('status', value)}
        />
      </div>
    </section>
  );
}

function ChipGroup({
  title,
  hint,
  options,
  selected,
  onToggle,
}: {
  title: string;
  hint: string;
  options: Facet[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div className="min-w-0">
      <div className="mb-2 flex items-baseline gap-2">
        <h3 className="text-xs font-medium text-ink-soft">{title}</h3>
        <span className="truncate text-[11px] text-ink-soft/75">{hint}</span>
      </div>
      <div className="no-scrollbar -mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:flex-wrap md:overflow-x-visible">
        {options.map((option) => {
          const isOn = selected.includes(option.value);
          return (
            <button
              key={option.value}
              type="button"
              onClick={() => onToggle(option.value)}
              aria-pressed={isOn}
              className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border py-1.5 pr-2.5 pl-3 text-xs font-medium transition-colors ${
                isOn
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-line bg-surface text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              {option.value}
              <span
                className={`nums rounded-full px-1.5 text-[10px] font-semibold ${
                  isOn ? 'bg-accent/15 text-accent-ink' : 'bg-muted text-ink-soft'
                }`}
              >
                {nf.format(option.count)}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
