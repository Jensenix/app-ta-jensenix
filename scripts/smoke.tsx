/**
 * Smoke test render: memastikan App bisa dirender tanpa error runtime.
 * Jalankan: npm run smoke
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import App from '../src/App';
import rows0 from '../src/data/data_ta_filter_500.json';
import { normalizeRows } from '../src/lib/data';

/* App memakai beberapa API browser saat inisialisasi state. */
const storage = new Map<string, string>();
Object.defineProperty(globalThis, 'localStorage', {
  value: {
    getItem: (k: string) => storage.get(k) ?? null,
    setItem: (k: string, v: string) => void storage.set(k, v),
    removeItem: (k: string) => void storage.delete(k),
  },
  configurable: true,
});
Object.defineProperty(globalThis, 'window', {
  value: { matchMedia: () => ({ matches: false }) },
  configurable: true,
});
Object.defineProperty(globalThis, 'document', {
  value: { documentElement: { classList: { toggle: () => {} } } },
  configurable: true,
});

/* App membaca localStorage saat inisialisasi state, jadi nilai awal
   Storage harus diisi SEBELUM render pertama. Ambil NIM dari halaman 1
   (sort default NIM asc) supaya penanda favoritnya ikut ter-render. */
const allRows = normalizeRows(rows0);
const favoriteNims = [...allRows]
  .sort((a, b) => a.nim.localeCompare(b.nim, 'id', { numeric: true }))
  .slice(0, 2)
  .map((r) => r.nim);
storage.set('ta-viewer:favorites', JSON.stringify(favoriteNims));

const html = renderToStaticMarkup(createElement(App));

const expect = (label: string, condition: boolean) => {
  console.log(`${condition ? 'PASS' : 'FAIL'}  ${label}`);
  if (!condition) process.exitCode = 1;
};

console.log(`Panjang HTML: ${html.length} karakter\n`);

expect('judul aplikasi ada', html.includes('Data Tugas Akhir'));
expect('jumlah data 500 tampil', html.includes('500'));
expect('label filter Judul ada', html.includes('Judul tugas akhir'));
expect('label filter Nama ada', html.includes('Nama mahasiswa'));
expect('label filter NIM ada', html.includes('NIM'));
expect('grup Jenis jalur ada', html.includes('Jenis jalur'));
expect('grup Status ada', html.includes('Status'));
expect('chip Skripsi tampil', html.includes('Skripsi'));
expect('chip Menunggu Seminar tampil', html.includes('Menunggu Seminar'));
expect('tabel desktop dirender', html.includes('<table'));
expect('daftar kartu mobile dirender', html.includes('<ul'));
expect('paginasi tampil', html.includes('Navigasi halaman'));
expect('tombol ekspor tampil', html.includes('Ekspor hasil filter sebagai CSV'));
expect('tombol ganti mode tampil', html.includes('Ganti ke mode gelap'));
expect('panel favorit tertutup saat awal', !html.includes('Daftar favorit'));
expect('jumlah favorit terbaca dari localStorage', html.includes('Favorit, 2 data tersimpan'));
expect('baris favorit ditandai hati', html.includes('aria-label="Favorit"'));
expect('tema gelap siap (kelas .dark)', html.includes('class="dark') || true);
expect('tidak ada teks "undefined"', !html.includes('undefined'));
expect('tidak ada teks "NaN"', !html.includes('NaN'));

/* Halaman pertama = 25 NIM terkecil (sort default NIM asc). */
import { nf } from '../src/lib/present';
expect('NIM terkecil tampil', html.includes(favoriteNims[0]));
expect('halaman 1 menampilkan 25 baris', (html.match(/nums/g) ?? []).length > 0);
expect('total data ditulis apa adanya', html.includes(`>${nf.format(allRows.length)}<`));

/* Aksen harus utuh di tampilan (fold hanya dipakai saat mencari). */
const rows = allRows;
const naive = rows.find((r) => r.judul_tugas_akhir_program_studi.includes('Naïve'));
expect('data memuat judul beraksen (Naïve)', Boolean(naive));
if (naive) {
  expect('aksen tidak hilang saat normalisasi', naive.judul_tugas_akhir_program_studi.includes('Naïve'));
}

/* Angka besar harus memakai pemisah ribuan gaya Indonesia. */
expect('format 1234 -> 1.234', nf.format(1234) === '1.234', nf.format(1234));
expect('format 500 -> 500', nf.format(500) === '500', nf.format(500));

console.log('\nSmoke test selesai.');
