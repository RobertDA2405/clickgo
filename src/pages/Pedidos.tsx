// src/pages/Pedidos.tsx
import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/client";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";

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

  const { data: orders = [], isLoading } = useQuery<Order[]>({
    queryKey: ["orders", user?.uid],
    queryFn: async () => {
      const q = query(collection(db, "orders"), where("userId", "==", user?.uid));
      const snapshot = await getDocs(q);
      return snapshot.docs.map((doc) => {
        const data = doc.data();
        return {
          id: doc.id,
          total: data.total ?? 0,
          estado: data.estado ?? "Pendiente",
          items: data.items ?? [],
          creadoEn: data.creadoEn?.toDate ? data.creadoEn.toDate().toLocaleString() : "Desconocida",
        };
      });
    },
    enabled: !!user,
  });

  if (isLoading) return <p className="text-center mt-10 text-gray-600">Cargando pedidos...</p>;
  if (orders.length === 0) return <p className="text-center mt-10 text-gray-600">No hay pedidos aún.</p>;

  const handleReorder = (items: OrderItem[]) => {
    items.forEach(item => addItem({
      productId: item.productId,
      nombre: item.nombre,
      precio: item.precio,
      cantidad: item.cantidad,
    }));
    alert("Productos agregados al carrito para volver a comprar!");
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">Historial de Pedidos</h2>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {orders.map(order => (
          <div key={order.id} className="bg-white rounded-lg shadow-md p-4 flex flex-col justify-between">
            <div>
              <p className="font-semibold">Pedido ID: {order.id}</p>
              <p className="text-sm text-gray-500">Fecha: {order.creadoEn}</p>
              <p className="text-sm">Estado: <span className={`font-semibold ${order.estado === 'Pendiente' ? 'text-yellow-500' : 'text-green-500'}`}>{order.estado}</span></p>
              <p className="text-sm mt-2 font-semibold">Total: ${order.total.toFixed(2)}</p>
              <ul className="mt-2 space-y-1">
                {order.items.map(item => (
                  <li key={item.productId} className="text-sm text-gray-700">
                    {item.nombre} x {item.cantidad} - ${ (item.precio * item.cantidad).toFixed(2) }
                  </li>
                ))}
              </ul>
            </div>
            <button
              onClick={() => handleReorder(order.items)}
              className="mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Volver a comprar
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
