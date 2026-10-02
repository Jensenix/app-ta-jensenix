/** Satu baris data tugas akhir, mengikuti struktur hasil scraping MIKA. */
export interface TaRow {
  nim: string;
  nama: string;
  judul_indonesia: string;
  judul_inggris: string;
  status: string;
  judul_tugas_akhir_program_studi: string;
  jenis_jalur: string;
  /**
   * Tautan repository tugas akhir. String kosong berarti tidak ada tautan
   * (data mentah null, atau URL-nya tidak bisa dibaca) — komponen bisa
   * membedakan "tidak ada repository" tanpa cek nulliness.
   */
  repository_uri: string;
}

export type SortKey = 'nim' | 'nama' | 'judul' | 'jenis_jalur' | 'status';
export type SortDir = 'asc' | 'desc';

export interface Filters {
  /** Pencarian teks bebas pada judul tugas akhir. */
  judul: string;
  /** Pencarian teks bebas pada nama mahasiswa. */
  nama: string;
  /** Pencarian parsial pada NIM, digit spasi/dash diabaikan. */
  nim: string;
  /** Jenis jalur aktif. Kosong = semua jenis jalur. */
  jenisJalur: string[];
  /** Status aktif. Kosong = semua status. */
  status: string[];
}

export interface Facet {
  value: string;
  count: number;
}
