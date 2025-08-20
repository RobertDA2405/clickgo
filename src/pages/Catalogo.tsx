import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';

export default function Catalogo() {
  const { data: products = [], isLoading, error } = useProducts();

  if (isLoading)
    return <p className="text-center text-gray-600 mt-10">Cargando productos...</p>;
  if (error)
    return <p className="text-red-500 text-center mt-10">Error al cargar: {error.message}</p>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold text-center mb-10 text-gray-800">
        Catálogo de Productos
      </h2>

      {/* Contenedor centrado para limitar ancho del grid */}
      <div className="flex justify-center">
        <div className="w-full max-w-[1280px]">
          <ProductGrid products={products} />
        </div>
      </div>

    </div>
  );
}
