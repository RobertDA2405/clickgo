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

  // Simula sections como Amazon (puedes filtrar por DB fields después)
  const ofertas = products.slice(0, 1); // Primer producto como "Super Oferta"
  const destacados = products.slice(0, 2); // Primeros 2 como "Destacados"
  const masVendidos = products.slice(2, 4); // Siguientes 2 como "Más Vendidos"
  const nuevos = products.slice(4); // Resto como "Nuevos"

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 bg-white text-gray-900"> {/* Cambio: Fondo white, texto dark para light mode */}
      <h2 className="text-3xl font-bold text-center mb-10 text-blue-600"> {/* Cambio: Acento azul como Amazon */}
        Catálogo de Productos
      </h2>

      {/* Búsqueda y categorías como Amazon */}
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        {/* Cambio: Light mode, focus ring */}
        <input
          type="text"
          placeholder="Buscar por nombre"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full sm:w-3/4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <select
          value={categoria}
          onChange={(e) => setCategoria(e.target.value)}
          className="w-full sm:w-1/4 p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Todas las categorías</option>
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
        </select>
      </div>

      {/* Mensajes */}
      {isLoading && (
        <p className="text-center text-gray-600 mt-10">Cargando productos...</p>
      )}
      {error && (
        <p className="text-red-500 text-center mt-10">Error: {error.message}</p>
      )}
      {!isLoading && !error && (
        <>
          {/* Super Oferta (banner como Amazon) */}
          {ofertas.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Super Oferta 1</h3>
              <ProductGrid products={ofertas} />
            </section>
          )}

          {/* Productos Destacados */}
          {destacados.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Productos Destacados</h3>
              <ProductGrid products={destacados} />
            </section>
          )}

          {/* Más Vendidos */}
          {masVendidos.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Más Vendidos</h3>
              <ProductGrid products={masVendidos} />
            </section>
          )}

          {/* Nuevos Productos */}
          {nuevos.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800">Nuevos Productos</h3>
              <ProductGrid products={nuevos} />
            </section>
          )}
        </>
      )}
    </div>
  );
} 