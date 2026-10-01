import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { TaRow } from '../types';
import { nf, statusTone } from '../lib/present';
import { Badge } from './Badge';
import { CloseIcon, DownloadIcon, HeartFilledIcon, HeartIcon, TrashIcon } from './Icons';

interface Props {
  rows: TaRow[];
  onClose: () => void;
  onOpen: (row: TaRow) => void;
  onRemove: (nim: string) => void;
  onClear: () => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

/**
 * Panel favorit yang turun dari tombol hati di header.
 * Klik di luar bagian `[data-fav-root]` atau tekan Esc akan menutupnya;
 * klik di tombol hati sendiri ditangani Header (toggle), bukan di sini.
 */
export function FavoritesPanel({
  rows,
  onClose,
  onOpen,
  onRemove,
  onClear,
  onExportCsv,
  onExportJson,
}: Props) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest('[data-fav-root]')) return;
      onClose();
    };
    document.addEventListener('keydown', onKey);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [onClose]);

  /* Fokuskan panel supaya Esc dan navigasi keyboard langsung bekerja. */
  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const exportDisabled = rows.length === 0;

  return (
    <div
      ref={panelRef}
      tabIndex={-1}
      role="dialog"
      aria-label="Daftar favorit"
      className="animate-panel scrollbar-slim absolute top-[calc(100%+0.5rem)] right-0 z-50 flex max-h-[min(70vh,32rem)] w-[min(24rem,calc(100vw-1.5rem))] flex-col overflow-y-auto rounded-xl border border-line bg-surface shadow-pop focus:outline-none"
    >
      <header className="sticky top-0 z-10 flex shrink-0 items-center justify-between gap-2 border-b border-line bg-surface/95 px-3 py-2.5 backdrop-blur">
        <h2 className="flex items-center gap-1.5 text-xs font-semibold text-ink">
          <HeartFilledIcon width={13} height={13} className="text-fav" />
          Favorit
          <span className="nums rounded-md bg-muted px-1.5 py-0.5 text-[11px] font-medium text-ink-soft">
            {nf.format(rows.length)}
          </span>
        </h2>
        <button
          type="button"
          onClick={onClose}
          aria-label="Tutup daftar favorit"
          className="-mt-1 -mr-1 shrink-0 rounded-md p-1 text-ink-soft transition-colors hover:bg-muted hover:text-ink"
        >
          <CloseIcon width={14} height={14} />
        </button>
      </header>

      {rows.length === 0 ? (
        <p className="flex flex-1 flex-col items-center justify-center gap-2 px-5 py-8 text-center">
          <HeartIcon width={22} height={22} className="text-ink-soft/50" />
          <span className="text-xs leading-relaxed text-ink-soft">
            Belum ada favorit.
            <br />
            Buka detail mahasiswa lalu tekan tombol hati.
          </span>
        </p>
      ) : (
        <ul className="divide-y divide-line">
          {rows.map((row) => (
            <li key={row.nim} className="flex items-start gap-1">
              <button
                type="button"
                onClick={() => onOpen(row)}
                className="min-w-0 flex-1 px-3 py-2.5 text-left transition-colors hover:bg-accent-soft/50"
              >
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                  <span className="nums text-[11px] font-semibold text-accent">{row.nim}</span>
                  <Badge tone={statusTone(row.status)}>{row.status}</Badge>
                </div>
                <p className="mt-1 truncate text-[13px] font-medium text-ink" title={row.nama}>
                  {row.nama}
                </p>
                <p className="mt-0.5 line-clamp-2 text-[11.5px] leading-snug text-ink-soft">
                  {row.judul_tugas_akhir_program_studi}
                </p>
              </button>
              <button
                type="button"
                onClick={() => onRemove(row.nim)}
                aria-label={`Hapus ${row.nama} dari favorit`}
                title="Hapus dari favorit"
                className="mt-2.5 shrink-0 rounded-md p-1.5 text-fav/70 transition-colors hover:bg-fav-soft hover:text-fav"
              >
                <HeartFilledIcon width={14} height={14} />
              </button>
            </li>
          ))}
        </ul>
      )}

      <footer className="sticky bottom-0 z-10 flex shrink-0 items-center gap-1 border-t border-line bg-surface/95 p-1.5 backdrop-blur">
        <FooterButton
          label="Ekspor favorit sebagai CSV"
          onClick={onExportCsv}
          disabled={exportDisabled}
        >
          <DownloadIcon width={13} height={13} /> CSV
        </FooterButton>
        <FooterButton
          label="Ekspor favorit sebagai JSON"
          onClick={onExportJson}
          disabled={exportDisabled}
        >
          <DownloadIcon width={13} height={13} /> JSON
        </FooterButton>
        <span className="flex-1" />
        <FooterButton label="Hapus semua favorit" onClick={onClear} disabled={exportDisabled}>
          <TrashIcon width={13} height={13} /> Kosongkan
        </FooterButton>
      </footer>
    </div>
  );
}

function FooterButton({
  label,
  onClick,
  disabled,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex h-7 items-center gap-1 rounded-md px-2 text-[11px] font-medium whitespace-nowrap text-ink-soft transition-colors enabled:hover:bg-muted enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}