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
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col"> {/* Cambio: White fondo, sombra */}
      {/* Imagen */}
      <div className="w-full h-48 flex items-center justify-center bg-gray-100"> {/* Cambio: Altura fija, fondo light */}
        {product.imagenes?.[0] ? (
          <>
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="max-h-full object-contain"
            />
            {/* Cambio: Object-contain para no crop */}
          </>
        ) : (
          <span className="text-gray-500">Imagen no disponible</span>
        )}
      </div>

      {/* Información */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-base font-medium text-gray-900 mb-1 line-clamp-2"> {/* Cambio: Font medium, gray dark */}
          {product.nombre}
        </h3>
        <p className="text-xs text-gray-500 mb-2 line-clamp-2"> {/* Cambio: Small, gray */}
          {product.descripcion}
        </p>
        <p className="text-lg font-bold text-gray-900 mb-1"> {/* Cambio: Bold, dark */}
          ${product.precio.toFixed(2)}
        </p>
        <p className="text-sm text-green-600 mb-2"> {/* Cambio: Green para "descuento" ficticio */}
          Ahorra 10% con Prime (ficticio)
        </p>
        <div className="text-yellow-400 text-sm mb-2"> {/* Cambio: Rating ficticio como Amazon */}
          ★★★★☆ (4.5)
        </div>
        <button
          onClick={handleAdd}
          className="mt-auto bg-yellow-400 text-gray-900 py-2 px-4 rounded hover:bg-yellow-500 transition-colors"
          aria-label={`Añadir ${product.nombre} al carrito`}
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;