// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import type { UseQueryOptions } from '@tanstack/react-query';
// Note: we'll dynamically obtain the DB instance from lazyClient inside the queryFn to avoid bundling firebase

export interface Product {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
  stock: number;
  activo: boolean;
  categoria: string;
}

/**
 * Hook to load active products. Keeps the old signature (categoria?: string)
 * but accepts an optional second parameter to pass react-query options.
 *
 * Usage: useProducts('Ropa') or useProducts(undefined, { staleTime: 60000 })
 */
export const useProducts = (
  categoria?: string,
  options?: UseQueryOptions<Product[], Error>,
  search?: string,
) => {
  const queryKey = ['products', categoria ?? 'all', search ?? ''] as const;

  const queryFn = async (): Promise<Product[]> => {
    try {
  const { getDb } = await import('../firebase/lazyClient');
  const db = await getDb();
  const { collection, query, where, getDocs, orderBy } = await import('firebase/firestore');

  // Build Firestore query without relying on the 'activo' field existing.
  // Some documents may omit 'activo' and should be treated as active by default.
  // We'll apply a client-side filter after fetching to avoid excluding documents where
  // the field is missing.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let q = query(collection(db as any, 'products'));

      if (search && search.trim().length > 0) {
        const s = search.trim().toLowerCase();
        // use nombreLower for case-insensitive prefix search when available
        q = query(q, where('nombreLower', '>=', s), where('nombreLower', '<=', s + '\uf8ff'));
        q = query(q, orderBy('nombreLower'));
      } else {
        if (categoria) {
          q = query(q, where('categoria', '==', categoria));
        }
        // default ordering: newest first when not searching
        q = query(q, orderBy('creadoEn', 'desc'));
      }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const snapshot = await getDocs(q as any);
  const products: Product[] = snapshot.docs.map((doc) => {
        const raw = doc.data() as Record<string, unknown>;
        const nombre = typeof raw.nombre === 'string' ? raw.nombre : '';
        const precio = typeof raw.precio === 'number' ? raw.precio : Number(raw.precio ?? 0);
        const descripcion = typeof raw.descripcion === 'string' ? raw.descripcion : '';
        const imagenes = Array.isArray(raw.imagenes) ? (raw.imagenes as string[]) : [];
        const stock = typeof raw.stock === 'number' ? raw.stock : Number(raw.stock ?? 0);
        const activo = raw.activo === undefined ? true : Boolean(raw.activo);
        const categoriaVal = typeof raw.categoria === 'string' ? raw.categoria : '';

        return {
          id: doc.id,
          nombre,
          precio,
          descripcion,
          imagenes,
          stock,
          activo,
          categoria: categoriaVal,
        } as Product;
      });
      // Filter out explicitly inactive documents (activo === false)
      return products.filter(p => p.activo !== false);
    } catch (err) {
      // Surface a readable error for react-query
      throw err instanceof Error ? err : new Error('Error cargando productos');
    }
  };

  return useQuery<Product[], Error>({
    queryKey,
    queryFn,
    // Short cache to avoid excessive reads but still provide UX snappiness
    staleTime: 1000 * 60, // 1 minute
    ...options,
  });
};