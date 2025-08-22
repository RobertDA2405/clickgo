import type { FC } from "react";
import { Link } from "react-router-dom";
import { useCartStore } from "../stores/cartStore";

interface ProductCardProps {
  product: {
    id: string;
    nombre: string;
    precio: number;
    imagenes?: string[];
    descripcion: string;
    rating?: number; // Nuevo: Para rating dinámico de DB
  };
}

const ProductCard: FC<ProductCardProps> = ({ product }) => {
  const addItem = useCartStore((state) => state.addItem);

  const handleAdd = () => {
    // Fly-to-cart animation: clone image and animate to cart badge
    const img = document.querySelector(`img[alt="${product.nombre}"]`) as HTMLImageElement | null;
    const badge = document.getElementById('cart-badge');

    if (img && badge) {
      const clone = img.cloneNode(true) as HTMLImageElement;
      clone.className = 'fly-img';
      const imgRect = img.getBoundingClientRect();
      clone.style.left = `${imgRect.left}px`;
      clone.style.top = `${imgRect.top}px`;
      clone.style.width = `${imgRect.width}px`;
      clone.style.height = `${imgRect.height}px`;
      document.body.appendChild(clone);

      const badgeRect = badge.getBoundingClientRect();
      // Force reflow
      void clone.offsetWidth;
      clone.style.transform = `translate(${badgeRect.left - imgRect.left}px, ${badgeRect.top - imgRect.top}px) scale(0.2)`;
      clone.style.opacity = '0.9';

      setTimeout(() => {
        clone.remove();
        addItem({ productId: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1 });
      }, 800);
      return;
    }

    addItem({ productId: product.id, nombre: product.nombre, precio: product.precio, cantidad: 1 });
  };

  const rating = Math.max(0, Math.min(5, product.rating ?? 4.5)); // Clamp 0-5

  return (
    <div className="product-card card-hover shadow-md hover:shadow-xl transition-shadow duration-300 flex flex-col mx-auto transform group-hover:-translate-y-1">
      <div className="w-full bg-gray-100 overflow-hidden rounded-t flex items-center justify-center" style={{height: 220}}>
        {product.imagenes?.[0] ? (
          <Link to={`/producto/${product.id}`} className="block h-full flex items-center justify-center w-full">
            <img
              src={product.imagenes[0]}
              alt={product.nombre}
              className="max-h-full object-contain mx-auto"
              style={{maxWidth: '90%'}}
            />
          </Link>
        ) : (
          <span className="text-gray-500">Imagen no disponible</span>
        )}
      </div>

      <div className="p-4 flex flex-col flex-grow min-h-[220px]">
        <Link to={`/producto/${product.id}`} className="block">
          <h3 className="text-lg font-semibold text-gray-900 mb-1 line-clamp-2">
            {product.nombre}
          </h3>
        </Link>
          <p className="text-sm text-gray-600 mb-3 line-clamp-2">
            {product.descripcion}
          </p>

          <div className="mt-auto space-y-3 text-center sm:text-left">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-2xl font-extrabold text-gray-900">${product.precio.toFixed(2)}</p>
              <div className="text-yellow-400 text-sm flex items-center gap-2" aria-hidden>
                {"★".repeat(Math.floor(rating)) + "☆".repeat(5 - Math.floor(rating))}
              </div>
            </div>

            <div className="text-sm text-gray-600">
              <span className="sr-only">Valoración: {rating} de 5</span>
            </div>

            <button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                handleAdd();
              }}
              className="w-full inline-flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-gray-900 py-2 px-4 rounded shadow-sm transition-colors font-semibold"
              aria-label={`Añadir ${product.nombre} al carrito`}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
                <path d="M3 3h2l.4 2M7 13h10l4-8H6.4" stroke="#111827" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Añadir
            </button>
          </div>
        </div>
    </div>
  );
};

export default ProductCard;