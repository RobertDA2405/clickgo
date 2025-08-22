import type { FC } from "react";
import ProductCard from "./ProductCard";

interface ProductGridProps {
  products: Array<{
    id: string;
    nombre: string;
    precio: number;
    imagenes: string[];
    descripcion: string;
  }>;
}

const ProductGrid: FC<ProductGridProps> = ({ products }) => {
  return (
    <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"> {/* Cambio: Gap-6 para espaciado mejor, no padding extra */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;