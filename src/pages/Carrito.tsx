// src/pages/Carrito.tsx
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function Carrito() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Carrito</h2>

      {items.length === 0 ? (
        <p className="text-white text-center">Carrito vacío. <Link to="/catalogo" className="text-blue-400">Explora productos</Link>.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between items-center bg-gray-700 p-4 rounded">
                <span className="text-white">{item.nombre} x {item.cantidad} - ${ (item.precio * item.cantidad).toFixed(2) }</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.productId, item.cantidad + 1)} className="bg-green-500 text-white px-2 py-1 rounded">+</button>
                  <button onClick={() => updateQuantity(item.productId, item.cantidad - 1)} disabled={item.cantidad <= 1} className="bg-yellow-500 text-white px-2 py-1 rounded">-</button>
                  <button onClick={() => removeItem(item.productId)} className="bg-red-500 text-white px-2 py-1 rounded">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-white font-bold mt-4 text-right">Total: ${total.toFixed(2)}</p>
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={clearCart} className="flex-1 bg-red-500 text-white px-4 py-2 rounded">Vaciar Carrito</button>
            <Link to="/checkout" className="flex-1 block bg-blue-500 text-white px-4 py-2 rounded text-center">Proceder a Pago</Link>
          </div>
        </>
      )}
    </div>
  );
}
