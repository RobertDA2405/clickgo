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
  <div className="product-grid grid gap-8 grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 stagger-fade"> {/* Aumentado gap + animación stagger */}
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;