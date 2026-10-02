import { useState } from 'react';
import type { Facet } from '../types';
import { nf } from '../lib/present';
import { ChevronDownIcon } from './Icons';

interface Props {
  total: number;
  filtered: number;
  statusFacets: Facet[];
  uniqueJudul: number;
  onPickStatus: (status: string) => void;
}

/**
 * Ringkasan angka dataset. Tiap kartu status bisa diklik untuk memfilter.
 *
 * Di mobile (2 kolom) hanya 4 kartu yang terlihat: Total data, Selesai,
 * Sedang ditampilkan, dan satu kartu "Lainnya" yang meringkas status
 * sisanya. Kartu "Lainnya" itu sekaligus sakelar: diklik untuk membuka
 * status sisanya, diklik lagi untuk menutupnya kembali jadi 4 kartu.
 *
 * Desktop (>= lg) menampilkan seluruh kartu seperti biasa, tanpa kartu
 * "Lainnya". Karena urutan DOM dipakai untuk desktop, pemindahan kartu di
 * mobile diatur lewat `order` — bukan dengan mengurutkan ulang markup-nya.
 */
export function StatStrip({ total, filtered, statusFacets, uniqueJudul, onPickStatus }: Props) {
  const [expanded, setExpanded] = useState(false);

  const shown = filtered === total ? total : Math.min(filtered, total);
  const pct = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  /* "Selesai" dapat slot sendiri di mobile; sisanya diringkas jadi satu
     kartu. Kalau tidak ada status bernama "Selesai", ambil yang terbesar. */
  const utama = statusFacets.find((facet) => /selesai/i.test(facet.value)) ?? statusFacets[0];
  const lainnya = utama ? statusFacets.filter((facet) => facet !== utama) : [];
  const totalLainnya = lainnya.reduce((sum, facet) => sum + facet.count, 0);

  return (
    <section
      aria-label="Ringkasan data"
      className="grid grid-cols-2 gap-2.5 sm:gap-3 lg:grid-cols-4"
    >
      <Card label="Total data" value={total} note={`${uniqueJudul} judul unik`} bar={100} barTone="accent" />

      {utama && <StatusCard facet={utama} pct={pct} onPick={onPickStatus} />}

      {/* Status sisanya disembunyikan di mobile sampai kartu "Lainnya" ditekan.
          Di desktop selalu tampil, berurut seperti sebelumnya. */}
      {lainnya.map((facet) => (
        <StatusCard
          key={facet.value}
          facet={facet}
          pct={pct}
          onPick={onPickStatus}
          className={`${expanded ? 'order-3' : 'hidden'} lg:order-none lg:block`}
        />
      ))}

      <Card
        className="order-1 lg:order-none"
        label="Sedang ditampilkan"
        value={shown}
        note={filtered === total ? 'semua data' : `dari ${nf.format(total)} data`}
        bar={total > 0 ? pct(shown) : 0}
        barTone="muted"
      />

      {lainnya.length > 0 && (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          title={expanded ? 'Sembunyikan status lainnya' : 'Tampilkan status lainnya'}
          className="order-2 flex flex-col rounded-xl border border-line bg-surface p-3 text-left shadow-panel transition-colors hover:border-accent focus-visible:border-accent sm:p-3.5 lg:hidden"
        >
          <p className="flex items-center gap-1 text-xs font-medium text-ink-soft">
            Lainnya
            <ChevronDownIcon
              width={13}
              height={13}
              className={`shrink-0 text-accent transition-transform ${expanded ? 'rotate-180' : ''}`}
            />
          </p>
          <p className="nums mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">
            {nf.format(totalLainnya)}
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-line-strong transition-[width] duration-500"
                style={{ width: `${Math.max(pct(totalLainnya), 2)}%` }}
              />
            </div>
            <span className="truncate text-[11px] font-medium text-ink-soft">
              {expanded ? 'ketuk untuk tutup' : ringkasLainnya(lainnya)}
            </span>
          </div>
        </button>
      )}
    </section>
  );
}

/** "Permohonan TA Non-Aktif +9" — dipangkas `truncate` kalau tidak muat. */
function ringkasLainnya(facets: Facet[]): string {
  const [terbesar, ...sisa] = facets;
  return `${terbesar.value}${sisa.length > 0 ? ` +${sisa.length}` : ''}`;
}

function StatusCard({
  facet,
  pct,
  onPick,
  className,
}: {
  facet: Facet;
  pct: (value: number) => number;
  onPick: (status: string) => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onPick(facet.value)}
      title={`Filter status: ${facet.value}`}
      className={`group rounded-xl border border-line bg-surface p-3 text-left shadow-panel transition-colors hover:border-line-strong focus-visible:border-accent sm:p-3.5 ${className ?? ''}`}
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
  );
}

function Card({
  label,
  value,
  note,
  bar,
  barTone,
  className,
}: {
  label: string;
  value: number;
  note: string;
  bar: number;
  barTone: 'accent' | 'muted';
  className?: string;
}) {
  return (
    <div
      className={`rounded-xl border border-line bg-surface p-3 shadow-panel sm:p-3.5 ${className ?? ''}`}
    >
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
