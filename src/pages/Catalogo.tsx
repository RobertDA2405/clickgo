import ProductGrid from '../components/ProductGrid';
import { useProducts } from '../hooks/useProducts';

export default function Catalogo() {
  const { data: products = [], isLoading, error } = useProducts();

  if (isLoading) return <p className="text-center">Cargando productos...</p>;
  if (error) return <p className="text-red-500">Error al cargar: {error.message}</p>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">Catálogo</h2>
      <ProductGrid products={products} />
    </div>
  );
}
