import type { FC } from 'react';
import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

const MiniCart: FC<{ className?: string }> = ({ className = '' }) => {
  const { items, removeItem } = useCartStore();

  const subtotal = useMemo(() => items.reduce((s, it) => s + it.precio * it.cantidad, 0), [items]);

  if (items.length === 0) {
    return (
      <div className={`mini-cart ${className}`}>
        <div className="p-4 text-center text-gray-600">Tu carrito está vacío</div>
        <div className="px-4 pb-4">
          <Link to="/catalogo" className="btn btn-primary w-full">Explorar productos</Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`mini-cart ${className}`}>
      <div className="p-3">
        {items.slice(0, 4).map((it) => (
          <div key={it.productId} className="flex items-center justify-between gap-3 py-2 border-b last:border-b-0">
            <div className="text-sm">
              <div className="font-medium text-gray-900">{it.nombre}</div>
              <div className="text-gray-600">{it.cantidad} x ${it.precio.toFixed(2)}</div>
            </div>
            <div className="flex flex-col items-end gap-1">
              <div className="text-sm font-semibold text-gray-900">${(it.precio * it.cantidad).toFixed(2)}</div>
              <button onClick={() => removeItem(it.productId)} className="text-xs text-red-500 hover:underline">Eliminar</button>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 border-t bg-gray-50">
        <div className="flex justify-between items-center mb-3">
          <div className="text-sm text-gray-700">Subtotal</div>
          <div className="font-bold">${subtotal.toFixed(2)}</div>
        </div>
        <div className="flex gap-2">
          <Link to="/carrito" className="btn btn-ghost flex-1">Ver Carrito</Link>
          <Link to="/checkout" className="btn btn-primary flex-1">Pagar</Link>
        </div>
      </div>
    </div>
  );
};

export default MiniCart;
