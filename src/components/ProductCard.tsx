import { FC } from 'react';

interface ProductCardProps {
  product: {
    id: string;
    nombre: string;
    precio: number;
    imagenes: string[];
    descripcion: string;
  };
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {product.imagenes[0] && (
        <img
          src={product.imagenes[0]}
          alt={product.nombre}
          className="w-full h-48 object-cover"
        />
      )}
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.nombre}</h3>
        <p className="text-gray-600 mb-2 line-clamp-2">{product.descripcion}</p>
        <p className="text-blue-600 font-bold">${product.precio.toFixed(2)}</p>
        <button
          className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors"
          aria-label={`Añadir ${product.nombre} al carrito`}
        >
          Añadir al carrito
        </button>
      </div>
    </div>
  );
};

export default ProductCard;