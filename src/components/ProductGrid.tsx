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
    <div className="grid justify-center gap-6 grid-cols-[repeat(auto-fit,minmax(220px,1fr))]">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default ProductGrid;
