import type { TaRow } from '../types';
import { statusTone } from '../lib/present';
import { Badge } from './Badge';
import { ChevronRightIcon, HeartFilledIcon } from './Icons';

/** Kartu bertumpuk sebagai pengganti tabel di layar kecil (< md). */
export function CardList({
  rows,
  startIndex,
  favorites,
  onSelect,
}: {
  rows: TaRow[];
  startIndex: number;
  favorites: Set<string>;
  onSelect: (row: TaRow) => void;
}) {
  return (
    <ul className="divide-y divide-line md:hidden">
      {rows.map((row, index) => (
        <li key={`${row.nim}-${index}`}>
          <button
            type="button"
            onClick={() => onSelect(row)}
            className="flex w-full items-start gap-3 px-3 py-3 text-left transition-colors hover:bg-accent-soft/50 sm:px-4"
          >
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                <span className="nums text-xs font-semibold text-accent">
                  {startIndex + index + 1}. {row.nim}
                </span>
                {favorites.has(row.nim) && (
                  <HeartFilledIcon
                    width={12}
                    height={12}
                    className="shrink-0 text-fav"
                    aria-label="Favorit"
                  />
                )}
                <Badge tone="neutral">{row.jenis_jalur}</Badge>
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </div>
              <p className="mt-1.5 text-sm font-medium text-ink">{row.nama}</p>
              <p className="mt-1 line-clamp-3 text-[13px] leading-snug text-ink-soft">
                {row.judul_tugas_akhir_program_studi}
              </p>
            </div>
            <ChevronRightIcon className="mt-0.5 shrink-0 text-ink-soft" width={16} height={16} />
          </button>
        </li>
      ))}
    </ul>
  );
}
