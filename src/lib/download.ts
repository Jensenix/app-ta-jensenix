import type { TaRow } from '../types';

const CSV_HEADERS = [
  'NIM',
  'Nama',
  'Judul Tugas Akhir Program Studi',
  'Judul Indonesia',
  'Judul Inggris',
  'Jenis Jalur',
  'Status',
] as const;

function csvCell(value: string): string {
  const text = (value ?? '').replace(/\s+/g, ' ').trim();
  return /[";\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

/** Ekspor CSV yang aman dibuka di Excel (dipisah titik koma + BOM UTF-8). */
export function rowsToCsv(rows: TaRow[]): string {
  const lines = [CSV_HEADERS.join(';')];
  for (const row of rows) {
    lines.push(
      [
        row.nim,
        row.nama,
        row.judul_tugas_akhir_program_studi,
        row.judul_indonesia,
        row.judul_inggris,
        row.jenis_jalur,
        row.status,
      ]
        .map(csvCell)
        .join(';'),
    );
  }
  return `\uFEFF${lines.join('\r\n')}\r\n`;
}

function download(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

export function exportCsv(rows: TaRow[], filename: string): void {
  download(rowsToCsv(rows), `${filename}.csv`, 'text/csv');
}

export function exportJson(rows: TaRow[], filename: string): void {
  download(
    JSON.stringify(rows, null, 2),
    `${filename}.json`,
    'application/json',
  );
}

/** Nama file aman + stempel waktu, mis. "data-ta-20261001-1432". */
export function timestampedName(prefix = 'data-ta'): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, '0');
  const stamp =
    `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}` +
    `-${pad(now.getHours())}${pad(now.getMinutes())}`;
  return `${prefix}-${stamp}`;
}
