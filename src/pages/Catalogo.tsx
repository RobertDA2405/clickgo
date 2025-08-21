// src/pages/Catalogo.tsx
import { useState } from 'react';
import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';

export default function Catalogo() {
  const [categoria, setCategoria] = useState('');
  const [search, setSearch] = useState('');
  const { data: allProducts = [], isLoading, error } = useProducts(categoria);

  const products = allProducts.filter(p => p.nombre.toLowerCase().includes(search.toLowerCase()));

  if (isLoading) return <p className="text-center text-gray-600 mt-10">Cargando productos...</p>;
  if (error) return <p className="text-red-500 text-center mt-10">Error al cargar: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Catálogo de Productos
      </h2>
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white"
        >
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
          {/* Añade más categorías según tu DB */}
        </select>
      </div>
      <div className="flex justify-center">
        <div className="w-full max-w-[1280px]">
          {products.length === 0 ? (
            <p className="text-center text-gray-600">No hay productos disponibles.</p>
          ) : (
            <ProductGrid products={products} />
          )}
        </div>
      </div>
    </div>
  );
};