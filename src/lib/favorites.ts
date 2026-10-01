import type { TaRow } from '../types';

/** Kunci localStorage untuk daftar NIM favorit. */
export const FAVORITES_KEY = 'ta-viewer:favorites';

/** Buang duplikat tanpa mengubah urutan. */
function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}

/**
 * Baca daftar NIM favorit dari localStorage. Nilai rusak atau localStorage
 * yang tidak diizinkan (mode privat) tidak boleh menggagalkan render, jadi
 * apa pun kondisinya fungsi ini selalu mengembalikan array yang bisa dipakai.
 */
export function loadFavoriteNims(): string[] {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return dedupe(parsed.filter((value): value is string => typeof value === 'string' && value.length > 0));
  } catch {
    return [];
  }
}

/** Simpan daftar NIM favorit. Kegagalan penulisan diabaikan diam-diam. */
export function saveFavoriteNims(nims: string[]): void {
  try {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(nims));
  } catch {
    /* localStorage penuh atau ditolak — favorit tetap jalan di memori */
  }
}

/**
 * Tambah atau hapus satu NIM dari daftar favorit. NIM yang baru ditambahkan
 * ditaruh di depan supaya data terbaru tampil paling atas di panel.
 */
export function toggleFavoriteNim(nims: string[], nim: string): string[] {
  if (!nim) return nims;
  return nims.includes(nim) ? nims.filter((item) => item !== nim) : [nim, ...nims];
}

/**
 * Cocokkan NIM favorit dengan baris data yang sedang dimuat. NIM yang sudah
 * tidak ada di data — mis. setelah memuat file JSON lain — dilewati diam-diam
 * supaya panel favorit tidak pernah menampilkan baris "hantu".
 */
export function resolveFavoriteRows(rows: TaRow[], nims: string[]): TaRow[] {
  if (nims.length === 0) return [];
  const index = new Map(rows.map((row) => [row.nim, row]));
  const picked: TaRow[] = [];
  for (const nim of nims) {
    const row = index.get(nim);
    if (row && !picked.includes(row)) picked.push(row);
  }
  return picked;
}