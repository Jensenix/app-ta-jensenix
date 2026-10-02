import { DocumentIcon } from './Icons';

interface Props {
  /** URL repository; string kosong = tidak ada tautan untuk baris ini. */
  href: string;
  /** NIM baris, dipakai agar aria-label unik saat dibaca screen reader. */
  nim: string;
  className?: string;
}

/**
 * Tombol kertas kecil yang membuka repository tugas akhir di tab baru.
 *
 * Ikonnya monokrom (garis `currentColor`) dan warnanya mengikuti teks
 * sekilas, lalu membiru saat hover — bukan ikon emoji berwarna.
 *
 * Baris tabel dan kartu mobile bisa diklik untuk membuka detail, jadi klik
 * dan tombol keyboard di sini dihentikan agar tidak membuka panel detail
 * bersamaan. Membuka detail tetap tersedia lewat area lain pada baris itu,
 * jadi tidak ada aksi yang hilang.
 *
 * Kalau baris tidak punya repository, komponen ini merender null —
 * pemanggil cukup mengoper nilai kosong tanpa cek manual.
 */
export function RepositoryLink({ href, nim, className }: Props) {
  if (!href) return null;

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      title={`Buka repository tugas akhir — ${href}`}
      aria-label={`Buka repository tugas akhir ${nim} di tab baru`}
      onClick={(event) => event.stopPropagation()}
      onKeyDown={(event) => event.stopPropagation()}
      className={`inline-flex size-6 shrink-0 items-center justify-center rounded-md text-ink-soft/70 transition-colors hover:bg-accent-soft hover:text-accent ${className ?? ''}`}
    >
      <DocumentIcon width={14} height={14} />
    </a>
  );
}
