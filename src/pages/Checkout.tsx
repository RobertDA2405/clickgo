import { useState } from "react";
import { useCartStore } from "../stores/cartStore";
// Firestore accessed lazily via lazyClient
import { useAuthStore } from "../stores/authStore";
// toasts imported dynamically where used to avoid bundling react-hot-toast in the shell

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
    try {
      const { createOrderViaFunction } = await import('../firebase/lazyClient');
  await createOrderViaFunction({ items: items.map(i => ({ productId: i.productId, nombre: i.nombre, precio: i.precio, cantidad: i.cantidad })), envio: { tipo: envio }, direccionEnvio: { direccion }, metodoPagoSimulado: { metodo: pago } });

      // dynamic toast import to avoid bundling react-hot-toast in shell
      const { toastSuccess } = await import('../utils/toast');
      await toastSuccess('Pedido registrado exitosamente!');
      clearCart();
      setDireccion('');
      setEnvio('estandar');
      setPago('contraentrega');
      setPago('contraentrega');
    } catch (err) {
  const msg = (err as Error).message;
  setError(msg);
  const { toastError } = await import('../utils/toast');
  await toastError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-max py-10 animate-fade-in">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Checkout</h1>
          <p className="text-slate-600 mt-2 text-sm">Completa los datos para finalizar tu pedido.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-10 items-start">
          <div className="lg:col-span-2 space-y-8">
            {items.length > 0 && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-slide-up">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Tu carrito</h2>
                <ul className="divide-y divide-slate-100">
                  {items.map(item => (
                    <li key={item.productId} className="flex justify-between py-3 text-sm">
                      <span className="font-medium text-slate-800">{item.nombre} x {item.cantidad}</span>
                      <span className="text-slate-700 font-semibold">${(item.precio * item.cantidad).toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
                <div className="flex justify-between pt-4 mt-4 border-t border-slate-200 font-semibold text-slate-900">
                  <span>Subtotal</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
              </div>
            )}
            <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 space-y-6 animate-slide-up">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Dirección de envío</label>
                <input type="text" value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Calle, número, ciudad" className="input-modern bg-slate-900/70" />
              </div>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Tipo de envío</label>
                  <select value={envio} onChange={(e) => setEnvio(e.target.value)} className="input-modern bg-slate-900/70">
                    <option value="estandar">Estándar ($5)</option>
                    <option value="express">Express ($10)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Método de pago</label>
                  <select value={pago} onChange={(e) => setPago(e.target.value)} className="input-modern bg-slate-900/70">
                    <option value="contraentrega">Contra entrega</option>
                    <option value="tarjeta">Tarjeta ficticia</option>
                  </select>
                </div>
              </div>
              {error && <p className="text-red-500 text-sm font-medium">{error}</p>}
              <div className="flex items-center justify-between pt-2">
                <span className="text-sm font-semibold text-slate-600">Total estimado</span>
                <span className="text-2xl font-extrabold tracking-tight text-green-600">${total.toFixed(2)}</span>
              </div>
              <button type="submit" disabled={loading || items.length === 0} className="btn-modern-primary disabled:opacity-50">
                {loading ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </form>
          </div>
          <aside className="lg:col-span-1 animate-slide-up">
            <div className="form-surface p-6 text-white">
              <h2 className="text-lg font-bold mb-4">Resumen rápido</h2>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between"><span>Artículos</span><span>{items.length}</span></div>
                <div className="flex justify-between"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Envío</span><span>${costosEnvio[envio as keyof typeof costosEnvio].toFixed(2)}</span></div>
              </div>
              <div className="flex justify-between font-semibold text-base mb-6"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <p className="text-xs text-slate-300 mb-6">Tus datos se procesan de forma segura y el pago es simulado para fines de demostración.</p>
              <button type="button" onClick={() => { if (!direccion) setDireccion('Dirección demo 123, Ciudad'); }} className="btn-modern-secondary">Autocompletar demo</button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};