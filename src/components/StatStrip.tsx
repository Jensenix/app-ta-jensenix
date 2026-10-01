import type { Facet } from '../types';
import { nf } from '../lib/present';

interface Props {
  total: number;
  filtered: number;
  statusFacets: Facet[];
  uniqueJudul: number;
  onPickStatus: (status: string) => void;
}

/** Ringkasan angka dataset. Tiap kartu status bisa diklik untuk memfilter. */
export function StatStrip({ total, filtered, statusFacets, uniqueJudul, onPickStatus }: Props) {
  const shown = filtered === total ? total : Math.min(filtered, total);
  const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  return (
    <section
      aria-label="Ringkasan data"
      className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
    >
      <Card label="Total data" value={total} note={`${uniqueJudul} judul unik`} bar={100} barTone="accent" />

      {statusFacets.map((facet) => (
        <button
          key={facet.value}
          type="button"
          onClick={() => onPickStatus(facet.value)}
          title={`Filter status: ${facet.value}`}
          className="group rounded-xl border border-line bg-surface p-3 text-left shadow-panel transition-colors hover:border-line-strong focus-visible:border-accent sm:p-3.5"
        >
          <p className="truncate text-xs font-medium text-ink-soft">{facet.value}</p>
          <p className="nums mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {nf.format(facet.count)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={`h-full rounded-full transition-[width] duration-500 ${
                  /menunggu/i.test(facet.value) ? 'bg-warn' : 'bg-ok'
                }`}
                style={{ width: `${Math.max(pct(facet.count), 1)}%` }}
              />
            </div>
            <span className="nums text-[11px] font-medium text-ink-soft">
              {pct(facet.count)}%
            </span>
          </div>
        </button>
      ))}

      <Card
        label="Sedang ditampilkan"
        value={shown}
        note={filtered === total ? 'semua data' : `dari ${nf.format(total)} data`}
        bar={total > 0 ? pct(shown) : 0}
        barTone="muted"
      />
    </section>
  );
}

function Card({
  label,
  value,
  note,
  bar,
  barTone,
}: {
  label: string;
  value: number;
  note: string;
  bar: number;
  barTone: 'accent' | 'muted';
}) {
  return (
    <div className="rounded-xl border border-line bg-surface p-3 shadow-panel sm:p-3.5">
      <p className="truncate text-xs font-medium text-ink-soft">{label}</p>
      <p className="nums mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
        {nf.format(value)}
      </p>
      <div className="mt-2 flex items-center gap-2">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
          <div
            className={`h-full rounded-full transition-[width] duration-500 ${
              barTone === 'accent' ? 'bg-accent' : 'bg-line-strong'
            }`}
            style={{ width: `${Math.max(bar, 2)}%` }}
          />
        </div>
        <span className="truncate text-[11px] font-medium text-ink-soft">{note}</span>
      </div>
    </div>
  );
}
