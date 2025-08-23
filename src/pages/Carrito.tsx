// src/pages/Carrito.tsx
import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';
// Firestore accessed lazily to keep SDK out of initial bundle
import { useCartStore } from '../stores/cartStore';

export default function Carrito() {
  const { items, removeItem, updateQuantity, clearCart } = useCartStore();
  const total = items.reduce((sum, item) => sum + item.precio * item.cantidad, 0);

  const [stocks, setStocks] = useState<Record<string, number | undefined>>({});
  const [loadingStocks, setLoadingStocks] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let mounted = true;
    const fetchStocks = async () => {
    const map: Record<string, number | undefined> = {};
    const { getDb } = await import('../firebase/lazyClient');
    const db = await getDb();
  await Promise.all(items.map(async (item) => {
        try {
          setLoadingStocks(prev => ({ ...prev, [item.productId]: true }));
            const { doc, getDoc } = await import('firebase/firestore');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const snap = await getDoc(doc(db as any, 'products', item.productId));
          if (snap.exists()) {
            const data = snap.data() as Record<string, unknown>;
            const stock = typeof data.stock === 'number' ? data.stock : (typeof data.stock === 'string' ? Number(data.stock) : undefined);
            map[item.productId] = stock;
          } else {
            map[item.productId] = undefined;
          }
        } catch {
          map[item.productId] = undefined;
        } finally {
          setLoadingStocks(prev => ({ ...prev, [item.productId]: false }));
        }
      }));
      if (mounted) setStocks(map);
    };

    if (items.length > 0) fetchStocks();
    return () => { mounted = false; };
  }, [items]);

  return (
    <div className="container-max py-10 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Carrito</h1>
          <p className="text-slate-600 mt-2 text-sm">Administra los productos antes de finalizar tu compra.</p>
        </div>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 flex flex-col gap-6">
            {items.length === 0 ? (
              <div className="p-10 bg-white rounded-xl border border-slate-200 text-center shadow-sm animate-slide-up">
                <p className="text-slate-600">Carrito vacío. <Link to="/catalogo" className="text-blue-600 hover:underline">Explora productos</Link>.</p>
              </div>
            ) : (
              <ul className="flex flex-col gap-5">
                {items.map((item) => (
                  <li key={item.productId} className="bg-white rounded-xl p-5 shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center gap-4 animate-slide-up">
                    <div className="flex-1">
                      <p className="font-semibold text-slate-900">{item.nombre}</p>
                      <p className="text-xs text-slate-500 mt-1">Cantidad: {item.cantidad}{typeof stocks[item.productId] === 'number' && stocks[item.productId] !== undefined ? ` / ${(stocks[item.productId] as number)}` : ''}</p>
                      <p className="text-sm font-medium text-slate-700 mt-1">${(item.precio * item.cantidad).toFixed(2)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={async () => {
                          const ok = await updateQuantity(item.productId, item.cantidad + 1);
                          if (!ok) {
                            const { toastError } = await import('../utils/toast');
                            await toastError('No hay suficiente stock disponible');
                          }
                        }}
                        disabled={loadingStocks[item.productId] || (typeof stocks[item.productId] === 'number' && item.cantidad >= (stocks[item.productId] as number))}
                        className="btn-modern-secondary w-10 h-10 flex items-center justify-center p-0 disabled:opacity-50"
                        aria-label={`Incrementar ${item.nombre}`}
                      >+
                      </button>
                      <button
                        onClick={async () => { await updateQuantity(item.productId, item.cantidad - 1); }}
                        disabled={item.cantidad <= 1}
                        className="btn-modern-secondary w-10 h-10 flex items-center justify-center p-0 disabled:opacity-50"
                        aria-label={`Disminuir ${item.nombre}`}
                      >-
                      </button>
                      <button onClick={() => removeItem(item.productId)} className="btn-modern-secondary w-24">Eliminar</button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <aside className="lg:col-span-1 animate-slide-up">
            <div className="form-surface p-6">
              <h2 className="text-lg font-semibold mb-4 text-slate-50">Resumen</h2>
              <p className="text-sm text-slate-300 mb-6">Verifica el total antes de proceder al pago.</p>
              <div className="flex justify-between text-sm mb-2 text-slate-200"><span>Artículos</span><span>{items.length}</span></div>
              <div className="flex justify-between font-semibold text-base mb-4 text-slate-50"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <div className="flex flex-col gap-3">
                <button onClick={clearCart} disabled={items.length === 0} className="btn-modern-secondary disabled:opacity-50">Vaciar carrito</button>
                <Link to="/checkout" className="btn-modern-primary text-center">Proceder a pago</Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}