import { useState, useEffect } from "react";
import ProductGrid from "../components/ProductGrid";
import { useProducts } from "../hooks/useProducts";
import { useLocation } from "react-router-dom";

export default function Catalogo() {
  const [categoria, setCategoria] = useState("");
  const [search, setSearch] = useState("");
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get("q") || "";
    setSearch(q);
  }, [location.search]);
  const { data: allProducts = [], isLoading, error } = useProducts(categoria);

  const products = allProducts.filter((p) =>
    p.nombre.toLowerCase().includes(search.toLowerCase())
  );

  // Sections como Amazon
  const ofertas = products.slice(0, 2); // Muestra hasta 2 para promociones
  const destacados = products.slice(0, 2); 
  const masVendidos = products.slice(2, 4);
  const nuevos = products.slice(4);

  return (
  <div className="container-max py-8 bg-white rounded-lg"> 
      <h2 className="text-3xl font-bold text-center mb-10 text-blue-600">
        Catálogo de Productos
      </h2>

      {/* Filtros centrados */}
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
          <option value="electronica">Electrónica</option>
          <option value="ropa">Ropa</option>
        </select>
      </div>

      {/* Mensajes centrados */}
      {isLoading && (
        <p className="text-center text-gray-600 mt-10">Cargando productos...</p>
      )}
      {error && (
        <p className="text-red-500 text-center mt-10">Error: {error.message}</p>
      )}
      {!isLoading && !error && (
        <>
          {/* Super Oferta */}
          {ofertas.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Super Oferta 1</h3>
              <div className="flex justify-center"> 
                <ProductGrid products={ofertas} />
              </div>
            </section>
          )}

          {/* Productos Destacados */}
          {destacados.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Productos Destacados</h3>
              <div className="flex justify-center">
                <ProductGrid products={destacados} />
              </div>
            </section>
          )}

          {/* Más Vendidos */}
          {masVendidos.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Más Vendidos</h3>
              <div className="flex justify-center">
                <ProductGrid products={masVendidos} />
              </div>
            </section>
          )}

          {/* Nuevos Productos */}
          {nuevos.length > 0 && (
            <section className="mb-12">
              <h3 className="text-2xl font-bold mb-4 text-gray-800 text-center">Nuevos Productos</h3>
              <div className="flex justify-center">
                <ProductGrid products={nuevos} />
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}