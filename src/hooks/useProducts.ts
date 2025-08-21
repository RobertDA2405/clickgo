// src/hooks/useProducts.ts
import { useQuery } from '@tanstack/react-query';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/client';

interface Product {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
  stock: number;
  activo: boolean;
  categoria: string;
}

export const useProducts = (categoria?: string) => {
  return useQuery<Product[]>({
    queryKey: ['products', categoria],
    queryFn: async () => {
      let q = query(collection(db, 'products'), where('activo', '==', true));
      if (categoria) {
        q = query(q, where('categoria', '==', categoria));
      }
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
    },
  });
};