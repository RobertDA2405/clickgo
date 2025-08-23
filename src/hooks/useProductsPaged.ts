import { useInfiniteQuery } from '@tanstack/react-query';
import type { Product } from './useProducts';

const PAGE_SIZE = 12;

export type ProductFilters = {
  minPrice?: number;
  maxPrice?: number;
  inStock?: boolean;
};

type Page = {
  items: Product[];
  // loosen type to match runtime snapshot generics returned by getDocs
  // loosened typing for runtime snapshots returned by dynamic imports
  lastDoc?: unknown | null; // opaque lastDoc used for pagination (do not rely on its type)
};

export const useProductsPaged = (categoria?: string, filters?: ProductFilters, search?: string) => {
  return useInfiniteQuery<Page, Error>({
    queryKey: ['products-paged', categoria ?? 'all', filters ?? {}, search ?? ''],
    // initialPageParam required by types for this version
    initialPageParam: null,
    queryFn: async ({ pageParam }: { pageParam?: unknown }) => {
      const pageDoc = pageParam as unknown | null | undefined;
      const { queryProductsPage } = await import('../firebase/lazyClient');
      const res = await queryProductsPage(categoria, filters, search, pageDoc);
      return { items: res.items, lastDoc: res.lastDoc } as Page;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.lastDoc) return undefined;
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return lastPage.lastDoc;
    },
  });
};
