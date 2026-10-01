import { useRef } from 'react';
import { DownloadIcon, LayersIcon, MoonIcon, SunIcon, UploadIcon } from './Icons';
import { nf } from '../lib/present';

interface Props {
  sourceName: string;
  rowCount: number;
  matched: number;
  dark: boolean;
  onToggleTheme: () => void;
  onPickFile: (file: File) => void;
  onExportCsv: () => void;
  onExportJson: () => void;
}

export function Header({
  sourceName,
  rowCount,
  matched,
  dark,
  onToggleTheme,
  onPickFile,
  onExportCsv,
  onExportJson,
}: Props) {
  const fileInput = useRef<HTMLInputElement>(null);
  const exportDisabled = matched === 0;

  return (
    <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur">
      {/* Tinggi baris dikunci (h-14) agar offset sticky tabel di DataTable presisi. */}
      <div className="mx-auto flex h-14 max-w-[1400px] items-center gap-2.5 px-3 sm:gap-3 sm:px-5">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-accent text-white shadow-panel">
          <LayersIcon width={18} height={18} />
        </span>

        <div className="min-w-0 flex-1">
          <h1 className="truncate text-[15px] leading-tight font-semibold text-ink">
            Data Tugas Akhir
          </h1>
          <p className="truncate text-[11px] leading-tight text-ink-soft">
            <span className="font-mono">{sourceName}</span>
            <span className="mx-1.5 text-line-strong">·</span>
            <span className="nums">{nf.format(rowCount)}</span> data
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onPickFile(file);
              // Reset nilai supaya memilih file yang sama lagi tetap memicu onChange.
              event.target.value = '';
            }}
          />

          <button
            type="button"
            onClick={() => fileInput.current?.click()}
            title="Muat file JSON lain"
            aria-label="Muat file JSON lain"
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            <UploadIcon width={15} height={15} />
          </button>

          <div className="flex items-center gap-0.5 rounded-lg border border-line bg-surface p-0.5">
            <ExportButton
              label="Ekspor hasil filter sebagai CSV"
              disabled={exportDisabled}
              onClick={onExportCsv}
              text="CSV"
            />
            <ExportButton
              label="Ekspor hasil filter sebagai JSON"
              disabled={exportDisabled}
              onClick={onExportJson}
              text="JSON"
            />
          </div>

          <button
            type="button"
            onClick={onToggleTheme}
            title={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            aria-label={dark ? 'Ganti ke mode terang' : 'Ganti ke mode gelap'}
            className="flex size-9 items-center justify-center rounded-lg border border-line bg-surface text-ink-soft transition-colors hover:border-line-strong hover:text-ink"
          >
            {dark ? <SunIcon width={15} height={15} /> : <MoonIcon width={15} height={15} />}
          </button>
        </div>
      </div>
    </header>
  );
}

function ExportButton({
  label,
  text,
  onClick,
  disabled,
}: {
  label: string;
  text: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      title={label}
      aria-label={label}
      className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-xs font-medium text-ink-soft transition-colors enabled:hover:bg-muted enabled:hover:text-ink disabled:cursor-not-allowed disabled:opacity-40"
    >
      <DownloadIcon width={14} height={14} />
      <span className="hidden sm:inline">{text}</span>
    </button>
  );
}
