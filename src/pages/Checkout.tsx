import { useState } from "react";
import { useCartStore } from "../stores/cartStore";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/client";
import { useAuthStore } from "../stores/authStore";

export default function Checkout() {
  const { items, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const [envio, setEnvio] = useState("estandar");
  const [pago, setPago] = useState("contraentrega");
  const [direccion, setDireccion] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const costosEnvio = { estandar: 5, express: 10 };
  const subtotal = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);
  const total = subtotal + costosEnvio[envio as keyof typeof costosEnvio];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("Debes iniciar sesión para hacer un pedido.");
      return;
    }
    if (items.length === 0) return;

    setLoading(true);
    setError(null);

    try {
      await addDoc(collection(db, "orders"), {
        userId: user.uid,
        items,
        envio: { tipo: envio, costo: costosEnvio[envio as keyof typeof costosEnvio] },
        direccionEnvio: direccion,
        metodoPago: pago,
        total,
        estado: "Pendiente",
        fecha: new Date(),
      });

      alert("Pedido registrado exitosamente!");
      clearCart();
      setDireccion("");
      setEnvio("estandar");
      setPago("contraentrega");
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-xl shadow-md text-gray-900"> {/* Cambio: White fondo, sombra */}
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Checkout</h2> {/* Cambio: Dark text */}

      {/* Carrito */}
      {items.length > 0 && (
        <div className="mb-6 bg-gray-100 p-4 rounded-lg shadow-sm space-y-3"> {/* Cambio: Light fondo, sombra */}
          <h3 className="text-xl font-semibold text-gray-800 mb-2">Tu carrito</h3> {/* Cambio: Dark text */}
          {items.map((item) => (
            <div
              key={item.productId}
              className="flex justify-between items-center text-gray-900"
            >
              <span>{item.nombre} x {item.cantidad}</span>
              <span>${(item.precio * item.cantidad).toFixed(2)}</span>
            </div>
          ))}
          <div className="flex justify-between mt-3 pt-2 border-t border-gray-300 font-bold text-gray-900"> {/* Cambio: Dark text */}
            <span>Subtotal:</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          value={direccion}
          onChange={(e) => setDireccion(e.target.value)}
          placeholder="Dirección de envío"
          className="w-full p-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />

        <select
          value={envio}
          onChange={(e) => setEnvio(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="estandar">Estándar ($5)</option>
          <option value="express">Express ($10)</option>
        </select>

        <select
          value={pago}
          onChange={(e) => setPago(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        >
          <option value="contraentrega">Contra entrega</option>
          <option value="tarjeta">Tarjeta ficticia</option>
        </select>

        {/* Total */}
        <div className="text-green-600 font-bold text-xl text-right"> {/* Cambio: Green como Amazon */}
          Total: ${total.toFixed(2)}
        </div>

        {error && <p className="text-red-500">{error}</p>}

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="w-full bg-yellow-400 text-gray-900 px-4 py-3 rounded-lg hover:bg-yellow-500 disabled:opacity-50 transition-colors"
        >
          {loading ? "Procesando..." : "Confirmar Pedido"}
        </button>
      </form>
    </div>
  );
};