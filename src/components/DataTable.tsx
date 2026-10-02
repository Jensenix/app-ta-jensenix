import type { ReactNode } from 'react';
import type { SortDir, SortKey, TaRow } from '../types';
import { statusTone } from '../lib/present';
import { Badge } from './Badge';
import { DocumentIcon, HeartFilledIcon, SortIcon } from './Icons';
import { RepositoryLink } from './RepositoryLink';

interface Props {
  rows: TaRow[];
  startIndex: number;
  sortKey: SortKey;
  sortDir: SortDir;
  favorites: Set<string>;
  onSort: (key: SortKey) => void;
  onSelect: (row: TaRow) => void;
}

const COLUMNS: Array<{
  key: SortKey | null;
  label: string;
  className?: string;
  headerClass?: string;
  /** Isi header sendiri (mis. ikon) — label tetap dipakai sebagai nama aksesibel. */
  header?: ReactNode;
}> = [
  { key: null, label: '#', className: 'w-12', headerClass: 'text-right' },
  { key: 'nim', label: 'NIM', className: 'w-[7.5rem]' },
  { key: 'nama', label: 'Nama mahasiswa', className: 'w-[13rem]' },
  { key: 'judul', label: 'Judul tugas akhir' },
  /* Kolom tipis di antara judul dan jalur: tempat tombol repository. */
  {
    key: null,
    label: 'Repository',
    className: 'w-11',
    headerClass: 'text-center',
    header: <DocumentIcon width={12} height={12} className="mx-auto" />,
  },
  { key: 'jenis_jalur', label: 'Jalur', className: 'hidden w-[7rem] lg:table-cell' },
  { key: 'status', label: 'Status', className: 'w-[9.5rem]' },
];

/** Tabel padat untuk layar lebar (>= md). */
export function DataTable({ rows, startIndex, sortKey, sortDir, favorites, onSort, onSelect }: Props) {
  return (
    <div className="hidden md:block">
      {/* border-separate (bukan border-collapse) + cell sendiri yang bikin garis:
          border-collapse merusak sticky <thead> dan garisnya ikut hilang saat nempel. */}
      <table className="w-full table-fixed border-separate border-spacing-0 text-left text-sm">
        {/* Latar header dibuat pekat, bukan transparan, supaya baris data
            di bawahnya tidak "tembus" terlihat. */}
        <thead className="sticky top-(--app-header-h) z-20 bg-surface">
          <tr>
            {COLUMNS.map((column) => {
              const active = column.key !== null && column.key === sortKey;
              return (
                <th
                  key={column.label}
                  scope="col"
                  aria-sort={
                    active ? (sortDir === 'asc' ? 'ascending' : 'descending') : undefined
                  }
                  /* Kolom berikon tidak punya teks; label jadi nama aksesibel. */
                  aria-label={column.header ? column.label : undefined}
                  className={`border-b border-line px-3 py-2.5 text-xs font-semibold text-ink-soft ${
                    column.className ?? ''
                  } ${column.headerClass ?? ''}`}
                >
                  {column.key ? (
                    <button
                      type="button"
                      onClick={() => onSort(column.key as SortKey)}
                      className={`inline-flex items-center gap-1 rounded transition-colors hover:text-ink ${
                        active ? 'text-ink' : ''
                      } ${column.headerClass === 'text-right' ? 'flex-row-reverse' : ''}`}
                    >
                      {column.label}
                      <SortIcon direction={active ? sortDir : 'none'} />
                    </button>
                  ) : (
                    (column.header ?? column.label)
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={`${row.nim}-${index}`}
              onClick={() => onSelect(row)}
              tabIndex={0}
              role="button"
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  event.preventDefault();
                  onSelect(row);
                }
              }}
              title="Klik untuk melihat detail"
              className="cursor-pointer transition-colors hover:bg-accent-soft/50 focus-visible:bg-accent-soft/60 [&>td]:border-b [&>td]:border-line/70 last:[&>td]:border-b-0"
            >
              <td className="nums px-3 py-2.5 text-right text-xs text-ink-soft/80">
                {startIndex + index + 1}
              </td>
              <td className="nums px-3 py-2.5 font-medium text-ink">
                <span className="inline-flex items-center gap-1">
                  {favorites.has(row.nim) && (
                    <HeartFilledIcon
                      width={12}
                      height={12}
                      className="shrink-0 text-fav"
                      aria-label="Favorit"
                    />
                  )}
                  {row.nim || '—'}
                </span>
              </td>
              <td className="truncate px-3 py-2.5 text-ink" title={row.nama}>
                {row.nama}
              </td>
              <td className="px-3 py-2.5">
                <p className="line-clamp-2 text-[13px] leading-snug text-ink" title={row.judul_tugas_akhir_program_studi}>
                  {row.judul_tugas_akhir_program_studi}
                </p>
              </td>
              <td className="px-3 py-2.5 text-center">
                <RepositoryLink href={row.repository_uri} nim={row.nim} />
              </td>
              <td className="hidden px-3 py-2.5 lg:table-cell">
                <Badge tone="neutral">{row.jenis_jalur}</Badge>
              </td>
              <td className="px-3 py-2.5">
                <Badge tone={statusTone(row.status)}>{row.status}</Badge>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
