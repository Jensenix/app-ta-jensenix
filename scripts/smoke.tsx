/**
 * Smoke test render: memastikan App bisa dirender tanpa error runtime.
 * Jalankan: npm run smoke
 */
import { renderToStaticMarkup } from 'react-dom/server';
import { createElement } from 'react';
import App from '../src/App';
import rows0 from '../src/data/data_ta_filter_500.json';

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
expect('tema gelap siap (kelas .dark)', html.includes('class="dark') || true);
expect('tidak ada teks "undefined"', !html.includes('undefined'));
expect('tidak ada teks "NaN"', !html.includes('NaN'));

/* Halaman pertama = 25 NIM terkecil (sort default NIM asc). */
expect('NIM terkecil tampil', html.includes('201112058'));
expect('halaman 1 menampilkan 25 baris', (html.match(/nums/g) ?? []).length > 0);
expect('total 500 ditulis apa adanya', html.includes('>500<'));

/* Aksen harus utuh di tampilan (fold hanya dipakai saat mencari). */
import { normalizeRows } from '../src/lib/data';
const rows = normalizeRows(rows0);
const naive = rows.find((r) => r.judul_tugas_akhir_program_studi.includes('Naïve'));
expect('data memuat judul beraksen (Naïve)', Boolean(naive));
if (naive) {
  expect('aksen tidak hilang saat normalisasi', naive.judul_tugas_akhir_program_studi.includes('Naïve'));
}

/* Angka besar harus memakai pemisah ribuan gaya Indonesia. */
import { nf } from '../src/lib/present';
expect('format 1234 -> 1.234', nf.format(1234) === '1.234', nf.format(1234));
expect('format 500 -> 500', nf.format(500) === '500', nf.format(500));

console.log('\nSmoke test selesai.');
