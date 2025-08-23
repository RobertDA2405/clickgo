// src/pages/Pedidos.tsx
import { useQuery, useQueryClient } from "@tanstack/react-query";
// Firestore used lazily via lazyClient
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import { useState, useMemo } from 'react';

interface OrderItem {
  productId: string;
  nombre: string;
  precio: number;
  cantidad: number;
}

interface Order {
  id: string;
  total: number;
  estado: string;
  items: OrderItem[];
  creadoEn: string; // fecha como string
}

export default function Pedidos() {
  const { user } = useAuthStore();
  const { addItem } = useCartStore();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<'todos' | 'pendiente' | 'cancelado' | 'completado' | 'entregado'>('todos');
  const [expanded, setExpanded] = useState<string | null>(null);

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders", user?.uid],
    queryFn: async () => {
      if (!user?.uid) return [];
      const { queryOrdersForUser } = await import('../firebase/lazyClient');
      return await queryOrdersForUser(user.uid);
    },
    enabled: !!user,
  });
  const normalized = useMemo(() => orders.map(o => ({
    ...o,
    estadoNorm: (o.estado || '').toLowerCase()
  })), [orders]);

  const filtered = useMemo(() => {
    if (filter === 'todos') return normalized;
    return normalized.filter(o => o.estadoNorm === filter);
  }, [filter, normalized]);

  const statusMeta: Record<string, { badge: string; label: string }> = {
    pendiente: { badge: 'badge-pendiente', label: 'Pendiente' },
    cancelado: { badge: 'badge-cancelado', label: 'Cancelado' },
    completado: { badge: 'badge-completado', label: 'Completado' },
    entregado: { badge: 'badge-entregado', label: 'Entregado' },
  };

  const handleReorder = async (items: OrderItem[]) => {
    items.forEach(item => addItem({
      productId: item.productId,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
    }));
  const { toastSuccess } = await import('../utils/toast');
  await toastSuccess('Productos agregados al carrito para volver a comprar!');
  };

  const handleCancel = async (orderId: string) => {
    const ok = window.confirm('¿Confirmas cancelar este pedido? Se restaurará el stock de los productos.');
    if (!ok) return;
    try {
      const { cancelOrderViaFunction } = await import('../firebase/lazyClient');
      await cancelOrderViaFunction(orderId);
      qc.invalidateQueries({ queryKey: ['orders', user?.uid] });
      const { toastSuccess } = await import('../utils/toast');
      await toastSuccess('Pedido cancelado y stock restaurado.');
    } catch (err) {
      const { toastError } = await import('../utils/toast');
      await toastError((err as Error).message);
    }
  };

  const handleDelete = async (orderId: string) => {
    const ok = window.confirm('¿Eliminar definitivamente este pedido cancelado?');
    if (!ok) return;
    try {
      const { getDb } = await import('../firebase/lazyClient');
      const db = await getDb();
      const { doc, deleteDoc } = await import('firebase/firestore');
      await deleteDoc(doc(db, 'orders', orderId));
      qc.invalidateQueries({ queryKey: ['orders', user?.uid] });
      const { toastSuccess } = await import('../utils/toast');
      await toastSuccess('Pedido eliminado.');
    } catch (err) {
      const { toastError } = await import('../utils/toast');
      await toastError('No se pudo eliminar: ' + (err as Error).message);
    }
  };

  return (
    <div className="container-max py-10 animate-fade-in">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-10">
          <div>
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Historial de pedidos</h2>
            <p className="text-slate-600 mt-2 text-sm">Revisa, filtra y vuelve a comprar fácilmente.</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="flex flex-wrap gap-2">
              {['todos','pendiente','completado','entregado','cancelado'].map(s => (
                <button key={s} onClick={() => setFilter(s as typeof filter)} className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${filter===s ? 'bg-yellow-400 text-slate-900' : 'bg-slate-200 text-slate-700 hover:bg-slate-300'}`}>{s==='todos' ? 'Todos' : statusMeta[s]?.label || s}</button>
              ))}
            </div>
            <div className="text-xs text-slate-500">Total: <span className="font-semibold text-slate-700">{orders.length}</span></div>
          </div>
        </div>

        {isLoading && <p className="text-center text-sm text-slate-500 py-16">Cargando pedidos...</p>}
        {!isLoading && orders.length === 0 && (
          <div className="p-10 bg-white border border-slate-200 rounded-xl text-center shadow-sm">
            <p className="text-slate-600">No hay pedidos aún.</p>
          </div>
        )}

        <div className="grid gap-8">
          {filtered.map(order => {
            const meta = statusMeta[order.estadoNorm] || statusMeta['pendiente'];
            const expandedThis = expanded === order.id;
            return (
              <article key={order.id} className="order-card bg-white rounded-2xl p-6 shadow-sm border border-slate-200 animate-slide-up relative" data-status={meta?.label}>
                <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-5">
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-slate-800">Pedido <span className="font-mono text-xs text-slate-500">#{order.id.slice(0,8)}</span></p>
                    <p className="text-xs text-slate-500">Creado: {order.creadoEn}</p>
                    <div>
                      <span className={`badge ${meta.badge}`}>{meta.label}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-slate-900 tracking-tight">${order.total.toFixed(2)}</p>
                    <p className="text-xs text-slate-500 mt-1">Total</p>
                  </div>
                </header>
                <section className="mt-5 pt-5 border-t border-slate-200">
                  <button onClick={() => setExpanded(expandedThis ? null : order.id)} className="mb-4 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wide px-3 py-1.5 rounded bg-slate-200 text-slate-700 hover:bg-slate-300 transition">
                    {expandedThis ? 'Ocultar artículos' : `Ver artículos (${order.items.length})`}
                  </button>
                  {expandedThis && (
                    <ul className="divide-y divide-slate-100 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden">
                      {order.items.map(item => (
                        <li key={item.productId} className="flex items-center justify-between py-3 px-4 gap-4">
                          <div className="min-w-0">
                            <p className="font-medium text-slate-800 truncate max-w-xs" title={item.nombre}>{item.nombre}</p>
                            <p className="text-xs text-slate-500 mt-0.5">Cant: {item.cantidad}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-slate-900 text-sm">${(item.precio * item.cantidad).toFixed(2)}</p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </section>
                <footer className="mt-6 flex flex-col sm:flex-row gap-4">
                  <button onClick={() => handleReorder(order.items)} className="flex-1 btn-modern-primary">Volver a comprar</button>
                  {order.estadoNorm !== 'cancelado' ? (
                    <button onClick={() => handleCancel(order.id)} className="flex-1 btn-modern-secondary">Cancelar pedido</button>
                  ) : (
                    <button onClick={() => handleDelete(order.id)} className="flex-1 btn-modern-secondary">Eliminar pedido</button>
                  )}
                </footer>
              </article>
            );
          })}
        </div>
      </div>
    </div>
  );
}
