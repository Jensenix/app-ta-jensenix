import type { ReactNode } from 'react';
import { nf } from '../lib/present';
import { pageItems } from '../lib/filters';
import { ChevronLeftIcon, ChevronRightIcon } from './Icons';

interface Props {
  page: number;
  totalPages: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
  onPageSize: (size: number) => void;
}

const SIZES = [25, 50, 100];

export function Pagination({
  page,
  totalPages,
  pageSize,
  total,
  onPage,
  onPageSize,
}: Props) {
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, total);

  return (
    <div className="flex flex-col gap-3 border-t border-line px-3 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-4">
      <div className="flex items-center gap-3 text-xs text-ink-soft">
        <span className="nums">
          Menampilkan <span className="font-semibold text-ink">{nf.format(from)}</span>–
          <span className="font-semibold text-ink">{nf.format(to)}</span> dari{' '}
          <span className="font-semibold text-ink">{nf.format(total)}</span>
        </span>
        <label className="flex items-center gap-1.5">
          <span className="hidden sm:inline">Baris</span>
          <select
            value={pageSize}
            onChange={(event) => onPageSize(Number(event.target.value))}
            className="nums rounded-md border border-line bg-surface px-1.5 py-1 text-xs text-ink outline-none hover:border-line-strong focus:border-accent"
          >
            {SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
        </label>
      </div>

      <nav aria-label="Navigasi halaman" className="flex items-center gap-1">
        <PageButton
          onClick={() => onPage(page - 1)}
          disabled={page <= 1}
          label="Halaman sebelumnya"
        >
          <ChevronLeftIcon width={14} height={14} />
        </PageButton>

        <div className="nums flex items-center gap-1">
          {pageItems(page, totalPages).map((item, index) =>
            item === 'gap' ? (
              <span key={`gap-${index}`} className="px-1 text-xs text-ink-soft/70">
                …
              </span>
            ) : (
              <button
                key={item}
                type="button"
                onClick={() => onPage(item)}
                aria-current={item === page ? 'page' : undefined}
                className={`size-8 rounded-md text-xs font-medium transition-colors ${
                  item === page
                    ? 'bg-accent text-white'
                    : 'text-ink-soft hover:bg-muted hover:text-ink'
                }`}
              >
                {nf.format(item)}
              </button>
            ),
          )}
        </div>

        <PageButton
          onClick={() => onPage(page + 1)}
          disabled={page >= totalPages}
          label="Halaman berikutnya"
        >
          <ChevronRightIcon width={14} height={14} />
        </PageButton>
      </nav>
    </div>
  );
}

function PageButton({
  onClick,
  disabled,
  label,
  children,
}: {
  onClick: () => void;
  disabled: boolean;
  label: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      title={label}
      className="flex size-8 items-center justify-center rounded-md border border-line text-ink-soft transition-colors enabled:hover:border-line-strong enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-35"
    >
      {children}
    </button>
  );
}
