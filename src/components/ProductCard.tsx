import type { FC } from "react";
import { useCartStore } from "../stores/cartStore";

interface ProductCardProps {
  product: {
    id: string;
    nombre: string;
    precio: number;
    imagenes?: string[];
    descripcion: string;
  };
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    addItem({
      productId: product.id,
      nombre: product.nombre,
      precio: product.precio,
      cantidad: 1,
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-md hover:shadow-xl transition-shadow duration-300 overflow-hidden flex flex-col">
      {/* Imagen */}
      <div className="w-full aspect-[1/1] bg-gray-100 flex items-center justify-center">
        {product.imagenes?.[0] ? (
          <img
            src={product.imagenes[0]}
            alt={product.nombre}
            className="w-full h-full object-contain"
          />
        ) : (
          <span className="text-gray-400">Imagen no disponible</span>
        )}
      </div>

      {/* Información */}
      <div className="flex flex-col flex-grow p-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
          {product.nombre}
        </h3>
        <p className="text-sm text-gray-600 mb-3 line-clamp-2">
          {product.descripcion}
        </p>

        <div className="mt-auto">
          <p className="text-xl font-bold text-blue-600 mb-3">
            ${product.precio.toFixed(2)}
          </p>
          <button
            onClick={handleAdd}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            aria-label={`Añadir ${product.nombre} al carrito`}
          >
            Añadir al carrito
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
