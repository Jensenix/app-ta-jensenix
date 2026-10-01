import type { Facet, Filters, SortDir, SortKey, TaRow } from '../types';

export const EMPTY_FILTERS: Filters = {
  judul: '',
  nama: '',
  nim: '',
  jenisJalur: [],
  status: [],
};

/** Buang aksen & huruf agar "naive" tetap cocok dengan judul "Naïve". */
export function fold(value: string): string {
  return value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase();
}

/** Pecah kueri menjadi kata kunci; semua kata harus ditemukan (AND). */
function keywords(query: string): string[] {
  return fold(query).split(/\s+/).filter(Boolean);
}

/** Cocok bila setiap kata kunci ada di dalam teks. */
function matches(haystack: string, query: string): boolean {
  const words = keywords(query);
  if (words.length === 0) return true;
  const target = fold(haystack);
  return words.every((word) => target.includes(word));
}

/** NIM dicocokkan hanya dari digit, jadi "2311 1124" tetap ketemu. */
function matchesNim(nim: string, query: string): boolean {
  const wanted = query.replace(/\D/g, '');
  if (!wanted) return true;
  return nim.includes(wanted);
}

export function filterRows(rows: TaRow[], filters: Filters): TaRow[] {
  const jalur = new Set(filters.jenisJalur);
  const status = new Set(filters.status);

  return rows.filter((row) => {
    if (jalur.size > 0 && !jalur.has(row.jenis_jalur)) return false;
    if (status.size > 0 && !status.has(row.status)) return false;
    if (!matches(row.judul_tugas_akhir_program_studi, filters.judul)) return false;
    if (!matches(row.nama, filters.nama)) return false;
    if (!matchesNim(row.nim, filters.nim)) return false;
    return true;
  });
}

/** Hitung frekuensi sebuah field, urut menurun lalu alfabetis. */
export function countFacets(rows: TaRow[], key: 'jenis_jalur' | 'status'): Facet[] {
  const counts = new Map<string, number>();
  for (const row of rows) {
    const value = row[key];
    counts.set(value, (counts.get(value) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value, 'id'));
}

const collator = new Intl.Collator('id', { numeric: true, sensitivity: 'base' });

export function sortRows(rows: TaRow[], key: SortKey, dir: SortDir): TaRow[] {
  const sign = dir === 'asc' ? 1 : -1;

  const compare = (a: TaRow, b: TaRow): number => {
    switch (key) {
      case 'nim':
        return sign * collator.compare(a.nim, b.nim);
      case 'nama':
        return sign * collator.compare(fold(a.nama), fold(b.nama));
      case 'judul':
        return (
          sign *
          collator.compare(
            fold(a.judul_tugas_akhir_program_studi),
            fold(b.judul_tugas_akhir_program_studi),
          )
        );
      case 'jenis_jalur':
        return (
          sign *
          (collator.compare(fold(a.jenis_jalur), fold(b.jenis_jalur)) ||
            collator.compare(fold(a.nama), fold(b.nama)))
        );
      case 'status':
        return (
          sign *
          (collator.compare(fold(a.status), fold(b.status)) ||
            collator.compare(fold(a.nama), fold(b.nama)))
        );
    }
  };

  // Salin dulu supaya array asli tidak termutasi.
  return [...rows].sort(compare);
}

/** Berapa filter yang sedang aktif — dipakai untuk tombol "Reset". */
export function countActiveFilters(filters: Filters): number {
  let total = 0;
  if (filters.judul.trim()) total += 1;
  if (filters.nama.trim()) total += 1;
  if (filters.nim.trim()) total += 1;
  total += filters.jenisJalur.length;
  total += filters.status.length;
  return total;
}

/** Nomor halaman dibatasi agar tidak keluar jangkauan setelah filter berubah. */
export function clampPage(page: number, totalPages: number): number {
  if (totalPages <= 0) return 1;
  return Math.min(Math.max(page, 1), totalPages);
}

/** Daftar halaman ringkas: 1 … 4 5 [6] 7 8 … 20 */
export function pageItems(current: number, total: number): Array<number | 'gap'> {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set<number>([1, total, current]);
  if (current <= 3) [2, 3, 4].forEach((p) => pages.add(p));
  if (current >= total - 2) [total - 3, total - 2, total - 1].forEach((p) => pages.add(p));
  pages.add(current - 1);
  pages.add(current + 1);

  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: Array<number | 'gap'> = [];
  let previous = 0;
  for (const page of sorted) {
    if (previous && page - previous > 1) result.push('gap');
    result.push(page);
    previous = page;
  }
  return result;
}
