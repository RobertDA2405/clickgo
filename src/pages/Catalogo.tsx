import { useState, useEffect, useRef } from "react";
import ProductGrid from "../components/ProductGrid";
import SkeletonCard from '../components/SkeletonCard';
import { useProducts, type Product } from "../hooks/useProducts";
import { useProductsPaged } from "../hooks/useProductsPaged";
// only category/search filters are used now
import { useDebouncedValue } from "../utils";
import { useLocation } from "react-router-dom";
// firestore imports are loaded lazily inside effects to keep initial bundle small
import { useQueryClient } from '@tanstack/react-query';
// db is fetched lazily via lazyClient

export default function Catalogo() {
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearch(q);
  }, [location.search]);
  const { data: allProducts = [], isLoading, isFetched, error } = useProducts(categoria);
  const qc = useQueryClient();

  const [categorias, setCategorias] = useState<Array<{ id: string; nombre: string }>>([]);

  const debouncedSearch = useDebouncedValue(search, 250);

  // Only category and search are used for paged queries now
  const paged = useProductsPaged(categoria, undefined, debouncedSearch);

  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const prefetchDoneRef = useRef(false);
  const prefetchTimerRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const { getDb } = await import('../firebase/lazyClient');
        const db = await getDb();
        const { collection, getDocs } = await import('firebase/firestore');
        const snap = await getDocs(collection(db as unknown as Parameters<typeof collection>[0], 'categories'));
        setCategorias(snap.docs.map(d => {
          const data = d.data() as Record<string, unknown>;
          return { id: d.id, nombre: typeof data.nombre === 'string' ? data.nombre : d.id };
        }));
      } catch {
        // ignore, keep default categories
      }
    })();
  }, []);

  // combine paged data into a flat list only when pages contain items.
  // Otherwise fall back to `allProducts` (same source as Home) so the catalog
  // still shows products when the paged query hasn't returned pages yet.
  const pagedHasPages = Boolean(paged.data && Array.isArray((paged.data as unknown as { pages?: unknown[] }).pages) && ((paged.data as unknown as { pages?: unknown[] }).pages || []).length > 0);
  const pagedItems: Product[] = pagedHasPages ? (paged.data as unknown as { pages: { items?: Product[] }[] }).pages.flatMap((p) => (p.items || [])) : [];

  // determine if any backend query completed at least once so we can avoid showing
  // "No se encontraron productos" before the first fetch finishes
  // Use presence of paged.data (not paged.isFetched) so we don't treat an in-flight
  // paged query as 'fetched' before any pages arrive.
  const anyFetched = Boolean(isFetched || (paged.data !== undefined));

  // When paged data is available we assume server-side filtering.
  // Otherwise apply client-side filters: search, min/max price and in-stock.
  const products = pagedHasPages
    ? pagedItems
    : pagedItems.concat(allProducts).filter((p: Product) => {
        const nameOk = !debouncedSearch || p.nombre.toLowerCase().includes((debouncedSearch || '').toLowerCase());
        return nameOk;
      });

  // Reset pagination when category changes so UI shows first page for the new category
  useEffect(() => {
    // Remove cached pages for previous category and fetch fresh first page for new category
  qc.removeQueries({ queryKey: ['products-paged', 'all'], exact: false });
  qc.invalidateQueries({ queryKey: ['products-paged', categoria ?? 'all', debouncedSearch ?? ''] });
    // scroll to top of the results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoria, qc, debouncedSearch]);

  // delayed prefetch to avoid wasted fetches when user is changing filters quickly
  useEffect(() => {
    // clear any pending timer when filters/search/categoria change
    if (prefetchTimerRef.current) {
      clearTimeout(prefetchTimerRef.current);
      prefetchTimerRef.current = null;
    }

    if (!prefetchDoneRef.current && paged.data && paged.hasNextPage) {
      // wait a short delay before prefetching
      prefetchTimerRef.current = window.setTimeout(() => {
        prefetchDoneRef.current = true;
        paged.fetchNextPage().catch(() => {
          prefetchDoneRef.current = false;
        });
        prefetchTimerRef.current = null;
      }, 700);
    }

    return () => {
      if (prefetchTimerRef.current) {
        clearTimeout(prefetchTimerRef.current);
        prefetchTimerRef.current = null;
      }
    };
  }, [paged, categoria, debouncedSearch]);

  // IntersectionObserver to auto-load next page
  useEffect(() => {
    const el = loadMoreRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && paged.hasNextPage && !paged.isFetchingNextPage) {
          paged.fetchNextPage().catch(() => {});
        }
      });
    }, { root: null, rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, [paged]);

  // Render all filtered products in a single grid so layout matches Home
  const isInitialFetching = isLoading || (paged.isFetching && (!paged.data || paged.data.pages.length === 0));

  return (
    <div className="container-max py-8 content-pad bg-white rounded-lg"> 
      <h2 className="text-3xl font-bold text-center mb-10 text-blue-600">
        Catálogo de Productos
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center max-w-3xl mx-auto">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          {categorias.length > 0 ? (
            categorias.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))
          ) : (
            <>
              <option value="electronica">Electrónica</option>
              <option value="ropa">Ropa</option>
            </>
          )}
        </select>
      </div>

  {/* Filters: only category and search are available */}

      {/* Mensajes centrados */}
      {isInitialFetching && (
        <div>
          <p className="text-center text-gray-600 mt-6">Cargando resultados...</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="p-4 bg-white rounded shadow">
                <SkeletonCard />
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <p className="text-red-500 text-center mt-10">Error: {error.message}</p>
      )}
      {!isInitialFetching && !error && (
        <>
          <section className="mb-12">
            <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Resultados</h3>
            <div className="relative">
              {/* overlay while refetching (category change or background refetch) */}
              {paged.isFetching && !isInitialFetching && (
                <div className="absolute inset-0 bg-white bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-10">
                  <div className="text-gray-700">Actualizando resultados...</div>
                </div>
              )}

              {products.length > 0 ? (
              <>
                <ProductGrid products={products} />
                {/* page-level skeletons while fetching next page */}
                {paged.isFetchingNextPage && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mt-6">
                    {Array.from({ length: 8 }).map((_, i) => (
                      <div key={i} className="p-4 bg-white rounded shadow animate-pulse">
                        <div className="w-full h-40 bg-gray-200 rounded mb-3" />
                        <div className="h-4 bg-gray-200 rounded w-3/4 mb-2" />
                        <div className="h-4 bg-gray-200 rounded w-1/2" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="text-center mt-6">
                  {paged.hasNextPage ? (
                    <button
                      onClick={() => { if (!paged.isFetchingNextPage) paged.fetchNextPage(); }}
                      disabled={paged.isFetchingNextPage}
                      className={`px-4 py-2 rounded text-white ${paged.isFetchingNextPage ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
                    >
                      {paged.isFetchingNextPage ? 'Cargando...' : 'Cargar más'}
                    </button>
                  ) : (
                    <p className="text-sm text-gray-500">No hay más productos.</p>
                  )}
                </div>
              </>
            ) : (
              anyFetched ? (
                <p className="text-center text-gray-600">No se encontraron productos.</p>
              ) : (
                <p className="text-center text-gray-600">Cargando resultados...</p>
              )
            )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}