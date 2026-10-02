import { useCallback, useEffect, useMemo, useState } from 'react';
import rawData from './data/data_ta_filter_500.json';
import type { Filters, SortDir, SortKey, TaRow } from './types';
import { normalizeRows } from './lib/data';
import {
  EMPTY_FILTERS,
  clampPage,
  countActiveFilters,
  countFacets,
  filterRows,
  sortRows,
} from './lib/filters';
import { exportCsv, exportJson, timestampedName } from './lib/download';
import {
  loadFavoriteNims,
  resolveFavoriteRows,
  saveFavoriteNims,
  toggleFavoriteNim,
} from './lib/favorites';
import { Header } from './components/Header';
import { StatStrip } from './components/StatStrip';
import { FilterPanel } from './components/FilterPanel';
import { DataTable } from './components/DataTable';
import { CardList } from './components/CardList';
import { Pagination } from './components/Pagination';
import { DetailDrawer } from './components/DetailDrawer';
import { EmptyState } from './components/EmptyState';
import { CloseIcon } from './components/Icons';

const SOURCE_NAME = 'data_ta_filter_500.json';
const THEME_KEY = 'ta-viewer:theme';
/* Ekspor favorit memakai nama sendiri, bukan mengikuti nama file sumber. */
const FAVORITE_FILE_NAME = 'favorit-tugas-akhir';

function initialRows(): TaRow[] {
  return normalizeRows(rawData);
}

function initialDark(): boolean {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) return saved === 'dark';
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

export default function App() {
  const [rows, setRows] = useState<TaRow[]>(initialRows);
  const [sourceName, setSourceName] = useState(SOURCE_NAME);
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sortKey, setSortKey] = useState<SortKey>('nim');
  const [sortDir, setSortDir] = useState<SortDir>('asc');
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [selected, setSelected] = useState<TaRow | null>(null);
  const [dark, setDark] = useState(initialDark);
  const [notice, setNotice] = useState<string | null>(null);
  /* Favorit disimpan sebagai NIM, bukan objek baris, supaya tetap berlaku
     walau data dimuat ulang dari file JSON lain. */
  const [favoriteNims, setFavoriteNims] = useState<string[]>(loadFavoriteNims);
  const [favoritesOpen, setFavoritesOpen] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem(THEME_KEY, dark ? 'dark' : 'light');
  }, [dark]);

  useEffect(() => {
    saveFavoriteNims(favoriteNims);
  }, [favoriteNims]);

  /* Facet dihitung dari seluruh data, bukan dari hasil filter — supaya
     angka dalam chip tidak ikut menyusut saat filter lain aktif. */
  const jalurFacets = useMemo(() => countFacets(rows, 'jenis_jalur'), [rows]);
  const statusFacets = useMemo(() => countFacets(rows, 'status'), [rows]);
  const uniqueJudul = useMemo(
    () => new Set(rows.map((row) => row.judul_tugas_akhir_program_studi)).size,
    [rows],
  );

  const favoriteSet = useMemo(() => new Set(favoriteNims), [favoriteNims]);
  const favoriteRows = useMemo(
    () => resolveFavoriteRows(rows, favoriteNims),
    [rows, favoriteNims],
  );

  const filtered = useMemo(() => filterRows(rows, filters), [rows, filters]);
  const sorted = useMemo(() => sortRows(filtered, sortKey, sortDir), [filtered, sortKey, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize));
  const currentPage = clampPage(page, totalPages);
  const startIndex = (currentPage - 1) * pageSize;
  const visibleRows = sorted.slice(startIndex, startIndex + pageSize);

  const activeCount = countActiveFilters(filters);

  /* Setiap perubahan filter/sortir/pageSize mengembalikan ke halaman 1. */
  const patchFilters = useCallback((patch: Partial<Filters>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
    setPage(1);
  }, []);

  const toggleFacet = useCallback((key: 'jenisJalur' | 'status', value: string) => {
    setFilters((prev) => {
      const current = prev[key];
      const next = current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value];
      return { ...prev, [key]: next };
    });
    setPage(1);
  }, []);

  const resetFilters = useCallback(() => {
    setFilters(EMPTY_FILTERS);
    setPage(1);
  }, []);

  const handleSort = useCallback(
    (key: SortKey) => {
      if (key === sortKey) {
        setSortDir((dir) => (dir === 'asc' ? 'desc' : 'asc'));
      } else {
        setSortKey(key);
        // Kolom teks diurutkan A→Z, kolom NIM tetap kecil→besar.
        setSortDir('asc');
      }
      setPage(1);
    },
    [sortKey],
  );

  /* Klik kartu statistik = nyalakan filter status tersebut. */
  const pickStatus = useCallback(
    (status: string) => {
      setFilters((prev) =>
        prev.status.includes(status)
          ? { ...prev, status: prev.status.filter((item) => item !== status) }
          : { ...prev, status: [...prev.status, status] },
      );
      setPage(1);
    },
    [],
  );

  const toggleFavorite = useCallback((row: TaRow) => {
    setFavoriteNims((prev) => toggleFavoriteNim(prev, row.nim));
  }, []);

  const removeFavorite = useCallback((nim: string) => {
    setFavoriteNims((prev) => prev.filter((item) => item !== nim));
  }, []);

  const clearFavorites = useCallback(() => setFavoriteNims([]), []);

  /* Buka detail dari panel favorit, lalu tutup panelnya supaya tidak
     menumpuk dua panel di layar yang sama. */
  const openFavorite = useCallback((row: TaRow) => {
    setFavoritesOpen(false);
    setSelected(row);
  }, []);

  const loadFile = useCallback(async (file: File) => {
    try {
      const text = await file.text();
      const parsed: unknown = JSON.parse(text);
      const next = normalizeRows(parsed);
      if (next.length === 0) {
        setNotice(`Gagal memuat ${file.name}: JSON tidak berisi array data yang bisa dibaca.`);
        return;
      }
      setRows(next);
      setSourceName(file.name);
      resetFilters();
      setSelected(null);
      setNotice(null);
    } catch {
      setNotice(`Gagal memuat ${file.name}: berkas JSON tidak valid.`);
    }
  }, [resetFilters]);

  const exportName = useCallback(() => {
    const slug = sourceName.replace(/\.json$/i, '') || 'data';
    return timestampedName(slug.slice(0, 40));
  }, [sourceName]);

  /* Membuka detail dari tabel/kartu juga menutup panel favorit. */
  const selectRow = useCallback((row: TaRow) => {
    setFavoritesOpen(false);
    setSelected(row);
  }, []);

  return (
    <div className="min-h-dvh bg-canvas">
      <Header
        sourceName={sourceName}
        rowCount={rows.length}
        matched={sorted.length}
        dark={dark}
        favoritesOpen={favoritesOpen}
        favorites={favoriteRows}
        onToggleFavorites={() => setFavoritesOpen((value) => !value)}
        onOpenFavorite={openFavorite}
        onRemoveFavorite={removeFavorite}
        onClearFavorites={clearFavorites}
        onToggleTheme={() => setDark((value) => !value)}
        onPickFile={loadFile}
        onExportCsv={() => exportCsv(sorted, exportName())}
        onExportJson={() => exportJson(sorted, exportName())}
        onExportFavoritesCsv={() => exportCsv(favoriteRows, FAVORITE_FILE_NAME)}
        onExportFavoritesJson={() => exportJson(favoriteRows, FAVORITE_FILE_NAME)}
      />

      <main className="mx-auto flex max-w-[1400px] flex-col gap-3 px-3 py-4 sm:gap-4 sm:px-5 sm:py-5">
        {notice && (
          <div
            role="status"
            className="flex items-start justify-between gap-3 rounded-xl border border-warn/35 bg-warn-soft px-3.5 py-2.5 text-xs text-warn"
          >
            <p className="leading-relaxed">{notice}</p>
            <button
              type="button"
              onClick={() => setNotice(null)}
              aria-label="Tutup pemberitahuan"
              className="-mt-0.5 -mr-1 shrink-0 rounded-md p-1 transition-colors hover:bg-warn/10"
            >
              <CloseIcon width={13} height={13} />
            </button>
          </div>
        )}

        <StatStrip
          total={rows.length}
          filtered={sorted.length}
          statusFacets={statusFacets}
          uniqueJudul={uniqueJudul}
          onPickStatus={pickStatus}
        />

        <FilterPanel
          filters={filters}
          jalurFacets={jalurFacets}
          statusFacets={statusFacets}
          matched={sorted.length}
          total={rows.length}
          activeCount={activeCount}
          onChange={patchFilters}
          onToggle={toggleFacet}
          onReset={resetFilters}
        />

        {/* Catatan: jangan pakai overflow-hidden di sini. Setiap nilai overflow
            selain visible membuat scroll container baru, dan sticky <thead>
            di dalam tabel lalu nempel ke container itu — bukan ke viewport —
            sehingga header menutupi baris data. */}
        <section
          aria-label="Daftar data tugas akhir"
          className="rounded-xl border border-line bg-surface shadow-panel"
        >
          {sorted.length === 0 ? (
            <EmptyState activeCount={activeCount} onReset={resetFilters} total={rows.length} />
          ) : (
            <>
              <DataTable
                rows={visibleRows}
                startIndex={startIndex}
                sortKey={sortKey}
                sortDir={sortDir}
                favorites={favoriteSet}
                onSort={handleSort}
                onSelect={selectRow}
              />
              <CardList
                rows={visibleRows}
                startIndex={startIndex}
                favorites={favoriteSet}
                onSelect={selectRow}
              />
              <Pagination
                page={currentPage}
                totalPages={totalPages}
                pageSize={pageSize}
                total={sorted.length}
                onPage={setPage}
                onPageSize={(size) => {
                  setPageSize(size);
                  setPage(1);
                }}
              />
            </>
          )}
        </section>

        <p className="pb-2 text-center text-[11px] leading-relaxed text-ink-soft/80">
          Sumber data: hasil scraping API MIKA · klik baris atau kartu untuk melihat detail · klik
          ikon kertas untuk membuka repository · tekan hati di detail untuk menandai favorit
          {sortKey !== 'nim' || sortDir !== 'asc' ? (
            <>
              {' '}
              · diurutkan berdasarkan <span className="font-medium">{sortKey}</span>{' '}
              {sortDir === 'asc' ? 'naik' : 'turun'}
            </>
          ) : null}
        </p>
      </main>

      <DetailDrawer
        row={selected}
        favorite={selected ? favoriteSet.has(selected.nim) : false}
        onToggleFavorite={() => selected && toggleFavorite(selected)}
        onClose={() => setSelected(null)}
      />
    </div>
  );
}
