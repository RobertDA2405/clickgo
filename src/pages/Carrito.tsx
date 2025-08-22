// src/pages/Carrito.tsx
import { Link } from 'react-router-dom';
import { useCartStore } from '../stores/cartStore';

export default function Carrito() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md text-gray-900"> {/* Cambio: White fondo, sombra */}
      <h2 className="text-2xl font-bold mb-6 text-gray-800 text-center">Carrito</h2> {/* Cambio: Dark text */}

      {items.length === 0 ? (
        <p className="text-gray-600 text-center">Carrito vacío. <Link to="/catalogo" className="text-blue-600 hover:text-blue-700">Explora productos</Link>.</p>
      ) : (
        <>
          <ul className="space-y-4">
            {items.map((item) => (
              <li key={item.productId} className="flex justify-between items-center bg-gray-100 p-4 rounded shadow-sm"> {/* Cambio: Light fondo, sombra */}
                <span className="text-gray-900">{item.nombre} x {item.cantidad} - ${ (item.precio * item.cantidad).toFixed(2) }</span> {/* Cambio: Dark text */}
                <div className="flex space-x-2">
                  <button onClick={() => updateQuantity(item.productId, item.cantidad + 1)} className="bg-green-500 text-white px-2 py-1 rounded hover:bg-green-600 transition-colors">+</button> {/* Cambio: Hover */}
                  <button onClick={() => updateQuantity(item.productId, item.cantidad - 1)} disabled={item.cantidad <= 1} className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 disabled:opacity-50 transition-colors">-</button>
                  <button onClick={() => removeItem(item.productId)} className="bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600 transition-colors">Eliminar</button>
                </div>
              </li>
            ))}
          </ul>

          <p className="text-green-600 font-bold mt-4 text-right text-xl">Total: ${total.toFixed(2)}</p> {/* Cambio: Green como Amazon */}
          <div className="flex flex-col sm:flex-row gap-4 mt-4">
            <button onClick={clearCart} className="flex-1 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition-colors">Vaciar Carrito</button> {/* Cambio: Hover */}
            <Link to="/checkout" className="flex-1 block bg-yellow-400 text-gray-900 px-4 py-2 rounded text-center hover:bg-yellow-500 transition-colors">Proceder a Pago</Link> {/* Cambio: Amarillo */}
          </div>
        </>
      )}
    </div>
  );
}