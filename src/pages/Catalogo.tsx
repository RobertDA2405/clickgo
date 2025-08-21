import { useState } from "react";
import ProductGrid from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";

export default function Catalogo() {
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const { data: allProducts = [], isLoading, error } = useProducts(categoria);

  const products = allProducts.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Catálogo de Productos
      </h2>

      {/* Filtros y búsqueda */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8 justify-center">
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-1/2 p-3 border border-gray-300 rounded-lg bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />

        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
        </select>
      </div>

      {/* Mensajes de estado */}
      {isLoading && (
        <p className="text-center text-gray-600 mt-10">Cargando productos...</p>
      )}
      {error && (
        <p className="text-red-500 text-center mt-10">Error: {error.message}</p>
      )}
      {!isLoading && !error && products.length === 0 && (
        <p className="text-center text-gray-600 mt-10">
          No hay productos disponibles.
        </p>
      )}

      {/* Grid de productos */}
      {!isLoading && !error && products.length > 0 && (
        <ProductGrid products={products} />
      )}
    </div>
  );
}
