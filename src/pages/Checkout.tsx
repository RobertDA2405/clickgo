// src/pages/Checkout.tsx
import { useState } from 'react';
import { useCartStore } from '../stores/cartStore';
import { httpsCallable } from 'firebase/functions';
import { functions } from '../firebase/client';

interface CartItem {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface CreateOrderInput {
  items: CartItem[];
  envio: { tipo: string; costo: number };
  direccionEnvio: string;
  metodoPagoSimulado: string;
}

interface CreateOrderOutput {
  url?: string;
  total?: number;
  estado?: string;
}

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const [envio, setEnvio] = useState('estandar');
  const [pago, setPago] = useState('contraentrega');
  const [direccion, setDireccion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costosEnvio = { estandar: 5, express: 10 };
  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + costosEnvio[envio as keyof typeof costosEnvio];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const createOrder = httpsCallable<CreateOrderInput, CreateOrderOutput>(
        functions,
        'createOrder'
      );

      const input: CreateOrderInput = {
        items,
        envio: { tipo: envio, costo: costosEnvio[envio as keyof typeof costosEnvio] },
        direccionEnvio: direccion,
        metodoPagoSimulado: pago,
      };

      const result = await createOrder(input);
      const data: CreateOrderOutput = result.data;

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert('Pedido simulado exitoso! Total: $' + (data.total ?? total).toFixed(2));
      }

      clearCart();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Checkout</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección de envío"
          className="w-full p-2 border rounded bg-gray-700 text-white"
        />
        <select
          value={envio}
          onChange={(e) => setEnvio(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white"
        >
          <option value="estandar">Estándar ($5)</option>
          <option value="express">Express ($10)</option>
        </select>
        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full p-2 border rounded bg-gray-700 text-white"
        >
          <option value="contraentrega">Contra entrega</option>
          <option value="tarjeta">Tarjeta ficticia</option>
        </select>
        <p className="text-white font-bold">Total: ${total.toFixed(2)}</p>
        {error && <p className="text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
        >
          {loading ? 'Procesando...' : 'Confirmar Pedido'}
        </button>
      </form>
    </div>
  );
}
