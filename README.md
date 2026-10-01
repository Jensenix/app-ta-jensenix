# Data Tugas Akhir — Viewer

Aplikasi React untuk melihat, mencari, dan memfilter data tugas akhir
hasil scraping API MIKA. Responsif penuh: tabel di layar lebar, kartu
bertumpuk di layar sempit.

## Menjalankan

```bash
npm install
npm run dev        # buka http://localhost:5173
```

Perintah lain:

```bash
npm run build      # typecheck + bundle produksi ke dist/
npm run preview    # jalankan hasil build
npm run check      # 52 tes logika filter/sort/paginasi/CSV/favorit
npm run smoke      # render App tanpa browser, cek tidak ada error
npm run typecheck  # tsc --noEmit
```

## Sumber data

Data bawaan ada di `src/data/data_ta_filter_500.json` (500 baris, salinan
dari `../data_ta_filter_500.json`). Struktur tiap baris:

| Field                            | Tipe            | Catatan                                  |
| -------------------------------- | --------------- | ---------------------------------------- |
| `nim`                            | string          | 9 digit, kunci unik                      |
| `nama`                           | string          | dirapikan, spasi tepi dibuang            |
| `judul_tugas_akhir_program_studi` | string          | judul utama, selalu ada                 |
| `judul_indonesia`                | string \| null  | boleh kosong                             |
| `judul_inggris`                  | string \| null  | boleh kosong                             |
| `status`                         | string          | mis. `Selesai`, `Menunggu Seminar`       |
| `jenis_jalur`                    | string          | mis. `Skripsi`, `Proyek`, `PKM`, `Publikasi` |

Untuk memuat hasil scraping yang lebih baru, klik tombol **muat** di
kepala aplikasi dan pilih file `.json` — array dengan struktur yang sama.
Filter, urutan, dan nomor halaman langsung direset.

Distribusi data bawaan: 458 Skripsi, 35 Proyek, 5 PKM, 2 Publikasi;
493 Selesai, 7 Menunggu Seminar.

## Fitur filter

- **Judul** — pencarian bebas, beberapa kata digabung dengan AND
- **Nama** — pencarian bebas pada nama mahasiswa
- **NIM** — sebagian digit cukup; spasi dan tanda hubung diabaikan
- **Jenis jalur** — chip multi-pilih dengan jumlah data per nilai
- **Status** — chip multi-pilih; klik kartu statistik status di atas
  untuk memfilter cepat

Pencarian mengabaikan perbedaan huruf besar-kecil dan tanda baca.
Teks beraksen tetap bisa dicari tanpa aksen: mengetik `naive bayes`
menemukan judul yang tertulis `Naïve Bayes`, sementara teks aslinya
tetap tampil apa adanya di tabel.

Jumlah pada chip selalu dihitung dari seluruh data, bukan dari hasil
filter, supaya angka tidak menyusut saat filter lain aktif.

## Fitur favorit

Klik baris atau kartu untuk membuka detail mahasiswa, lalu tekan **hati**
di dalam detail. Data itu masuk ke daftar favorit.

- Tombol hati di header — sebaris dengan ekspor CSV/JSON dan ganti mode —
  menampilkan jumlah favorit di badge. Membukanya dropping panel berisi
  seluruh data yang ditandai.
- Dari panel: klik satu item untuk membuka detailnya, tekan hati merah
  untuk menghapus, atau ekspor langsung ke CSV/JSON, atau kosongkan
  semua. Tekan `Esc` atau klik di luar untuk menutup.
- Baris dan kartu yang sudah difavoritkan diberi hati merah kecil di
  sebelah NIM, jadi mudah dikenali saat scrolling.
- Favorit disimpan sebagai daftar NIM di `localStorage`
  (`ta-viewer:favorites`), bukan objek baris utuh. Efeknya: favorit tetap
  berlaku walau file JSON lain dimuat, dan NIM yang sudah tidak ada di
  data akan dilewati diam-diam oleh panel.

## Fitur lain

- **Urutkan** — klik judul kolom: NIM, Nama, Judul, Jalur, Status.
  Klik dua kali untuk membalik arah.
- **Detail** — klik baris atau kartu untuk membuka panel berisi judul
  Indonesia dan Inggris. Tekan `Esc` untuk menutup.
- **Ekspor** — CSV (pemisah `;` + BOM UTF-8, langsung rapi di Excel) dan
  JSON, keduanya hanya berisi baris hasil filter, sudah terurut.
- **Favorit** — lihat di bawah.
- **Tema** — terang/gelap, mengikuti preferensi sistem lalu disimpan di
  `localStorage`.
- **Paginasi** — 25/50/100 baris per halaman.

## Struktur

```
src/
  App.tsx                 state dan orkestrasi
  types.ts                tipe TaRow, Filters, SortKey
  lib/
    data.ts               normalisasi JSON mentah -> TaRow
    filters.ts            filter, facet, sort, paginasi (murni, tanpa React)
    favorites.ts          NIM favorit + persistensi localStorage (murni)
    download.ts           CSV/JSON + trigger unduhan
    present.ts            pemetaan warna status, format angka
  components/
    Header.tsx            judul, muat file, ekspor, tombol favorit, tema
    FavoritesPanel.tsx    panel daftar favorit dari header
    StatStrip.tsx         kartu ringkasan
    FilterPanel.tsx       kolom pencarian + chip
    DataTable.tsx         tabel (>= 768px)
    CardList.tsx          kartu (< 768px)
    DetailDrawer.tsx      panel detail + tombol hati
    Pagination.tsx        navigasi halaman
    EmptyState.tsx        keadaan kosong
    Badge.tsx, Icons.tsx  komponen kecil
scripts/
  check.ts                tes logika
  smoke.tsx               tes render
```

Styling memakai Tailwind CSS v4 dengan token warna di `src/index.css`.
Warna didefinisikan sekali sebagai variabel CSS lalu dipetakan lewat
`@theme inline`, sehingga mode gelap cukup berubah lewat satu variabel
`dark` pada `<html>` — tidak ada pasangan kelas `dark:` di tiap komponen.
