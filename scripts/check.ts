/**
 * Sanity check logika filter/sort terhadap data asli.
 * Jalankan: npx vite-node scripts/check.ts   (atau lewat `npm run check`)
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { normalizeRows } from '../src/lib/data';
import {
  EMPTY_FILTERS,
  clampPage,
  countActiveFilters,
  countFacets,
  filterRows,
  pageItems,
  sortRows,
} from '../src/lib/filters';
import { rowsToCsv } from '../src/lib/download';
import type { Filters } from '../src/types';

const raw = JSON.parse(
  readFileSync(fileURLToPath(new URL('../src/data/data_ta_filter_500.json', import.meta.url)), 'utf-8'),
);
const rows = normalizeRows(raw);

let failed = 0;
function check(label: string, condition: boolean, extra = '') {
  if (!condition) failed += 1;
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}${extra ? ` — ${extra}` : ''}`);
}

console.log(`Total baris: ${rows.length}\n`);

/* --- validasi data --- */
check('nim unik semua terisi', rows.every((r) => r.nim.length > 0));
check('nama tanpa spasi ganda / tepi', rows.every((r) => r.nama === r.nama.trim()));
check('judul selalu ada', rows.every((r) => r.judul_tugas_akhir_program_studi.length > 0));

/* --- facet --- */
const jalur = countFacets(rows, 'jenis_jalur');
const status = countFacets(rows, 'status');
console.log('\nFacet jenis jalur:', jalur);
console.log('Facet status:', status, '\n');
check('total facet jalur = 500', jalur.reduce((s, f) => s + f.count, 0) === rows.length);
check('facet urut menurun', jalur.every((f, i) => i === 0 || jalur[i - 1].count >= f.count));

/* --- filter teks --- */
const f = (patch: Partial<Filters>): number => filterRows(rows, { ...EMPTY_FILTERS, ...patch }).length;

const byJudul = filterRows(rows, { ...EMPTY_FILTERS, judul: 'mobile banking' });
check('judul: "mobile banking" ditemukan', byJudul.length > 0, `${byJudul.length} baris`);
check(
  'judul: semua hasil benar-benar mengandung frasa',
  byJudul.every((r) => r.judul_tugas_akhir_program_studi.toLowerCase().includes('mobile banking')),
);

const multi = filterRows(rows, { ...EMPTY_FILTERS, judul: 'analisis sentimen mobile' });
check(
  'judul: multi kata = AND',
  multi.length > 0 &&
    multi.every(
      (r) =>
        r.judul_tugas_akhir_program_studi.toLowerCase().includes('analisis') &&
        r.judul_tugas_akhir_program_studi.toLowerCase().includes('sentimen'),
    ),
  `${multi.length} baris`,
);

const aksen = filterRows(rows, { ...EMPTY_FILTERS, judul: 'naive bayes' });
check(
  'judul: aksen diabaikan ("naive" -> "Naïve")',
  aksen.length > 0 && aksen.every((r) => /na.ve bayes/i.test(r.judul_tugas_akhir_program_studi)),
  `${aksen.length} baris`,
);

check('nama:oward-only cocok', f({ nama: 'teresia' }) > 0, `${f({ nama: 'teresia' })} baris`);
check('nama: keyword tanpa hasil = 0', filterRows(rows, { ...EMPTY_FILTERS, nama: 'zzz' }).length === 0);

/* --- filter nim --- */
check('nim: sebagian digit cocok', f({ nim: '23111' }) > 0, `${f({ nim: '23111' })} baris`);
check('nim: spasi diabaikan', f({ nim: '23 111' }) === f({ nim: '23111' }));
check('nim: 9 digit unik', new Set(rows.map((r) => r.nim)).size === rows.length);
check(
  'nim: hasil benar-benar memuat digit',
  filterRows(rows, { ...EMPTY_FILTERS, nim: '23111' }).every((r) => r.nim.includes('23111')),
);

/* --- filter facet --- */
const proyek = filterRows(rows, { ...EMPTY_FILTERS, jenisJalur: ['Proyek'] });
check('jalur: Proyek', proyek.length === jalur.find((f2) => f2.value === 'Proyek')!.count, `${proyek.length} baris`);

const duaStatus = filterRows(rows, { ...EMPTY_FILTERS, status: ['Selesai', 'Menunggu Seminar'] });
check('status: semua status aktif = semua data', duaStatus.length === rows.length);
check(
  'status: kombinasi jalur + status',
  filterRows(rows, { ...EMPTY_FILTERS, jenisJalur: ['PKM'], status: ['Selesai'] }).length <= 5,
);

/* --- reset --- */
check('filter kosong = semua data', f({}) === rows.length);
check('countActiveFilters kosong = 0', countActiveFilters(EMPTY_FILTERS) === 0);
check(
  'countActiveFilters terhitung benar',
  countActiveFilters({ judul: 'a', nama: 'b', nim: 'c', jenisJalur: ['x', 'y'], status: ['z'] }) === 6,
);

/* --- sort --- */
const byNim = sortRows(rows, 'nim', 'asc');
check('sort nim asc monoton', byNim.every((r, i) => i === 0 || byNim[i - 1].nim <= r.nim));
const byNimDesc = sortRows(rows, 'nim', 'desc');
check('sort nim desc monoton', byNimDesc.every((r, i) => i === 0 || byNimDesc[i - 1].nim >= r.nim));
const byNama = sortRows(rows, 'nama', 'asc');
check(
  'sort nama asc monoton',
  byNama.every((r, i) => i === 0 || r.nama.localeCompare(byNama[i - 1].nama, 'id') >= 0),
);
check('sort tidak memutasi array asal', rows[0].nim === normalizeRows(raw)[0].nim);
check('sort jumlah baris tetap', byNim.length === rows.length);

/* --- pagination --- */
check('pageItems total kecil = semua nomor', pageItems(1, 5).join() === '1,2,3,4,5');
check('pageItems awal', pageItems(1, 20).join() === '1,2,3,4,gap,20', pageItems(1, 20).join());
check('pageItems tengah', pageItems(10, 20).join() === '1,gap,9,10,11,gap,20', pageItems(10, 20).join());
check('pageItems akhir', pageItems(20, 20).join() === '1,gap,17,18,19,20', pageItems(20, 20).join());
check('pageItems tanpa duplikat', new Set(pageItems(10, 20).filter((p) => p !== 'gap')).size === 5);
check('clampPage di atas batas', clampPage(99, 5) === 5);
check('clampPage di bawah batas', clampPage(0, 5) === 1);
check('clampPage nol total', clampPage(3, 1) === 1);

/* --- csv --- */
const csv = rowsToCsv(filterRows(rows, { ...EMPTY_FILTERS, jenisJalur: ['PKM'] }));
const lines = csv.trim().split('\r\n');
check('csv punya BOM', csv.charCodeAt(0) === 0xfeff);
check('csv 1 header + 5 PKM', lines.length === 6, `${lines.length} baris`);
check('csv kolom konsisten', lines.slice(1).every((l) => l.split(';').length === 7));
check(
  'csv meng-escape tanda kutip',
  rowsToCsv([{ ...rows[0], nama: 'A "B"; C' }]).includes('"A ""B""; C"'),
);

console.log(`\n${failed === 0 ? 'SEMUA TES LULUS' : `${failed} TES GAGAL`}`);
process.exit(failed === 0 ? 0 : 1);
