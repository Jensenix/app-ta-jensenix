import type { TaRow } from '../types';

const EMPTY = '\u2014'; // em dash, untuk nilai kosong

/** Rapatkan spasi berlebih dan buang spasi di tepi. */
function tidy(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\s+/g, ' ').trim();
}

/** Jumlah NIM hanya boleh digit, agar aman dipakai sebagai kode. */
function tidyNim(value: unknown): string {
  return typeof value === 'number' ? String(value) : tidy(value).replace(/\s+/g, '');
}

/**
 * Terjemahkan JSON mentah (hasil scraping) menjadi baris yang seragam:
 * semua string dirapikan, `null` menjadi string kosong supaya tidak perlu
 * diaspora cek nulliness di komponen.
 */
export function normalizeRows(input: unknown): TaRow[] {
  if (!Array.isArray(input)) return [];

  const rows: TaRow[] = [];
  for (const raw of input) {
    if (!raw || typeof raw !== 'object') continue;
    const r = raw as Record<string, unknown>;
    rows.push({
      nim: tidyNim(r.nim),
      nama: tidy(r.nama) || EMPTY,
      judul_indonesia: tidy(r.judul_indonesia),
      judul_inggris: tidy(r.judul_inggris),
      status: tidy(r.status) || EMPTY,
      judul_tugas_akhir_program_studi: tidy(r.judul_tugas_akhir_program_studi) || EMPTY,
      jenis_jalur: tidy(r.jenis_jalur) || EMPTY,
    });
  }
  return rows;
}
