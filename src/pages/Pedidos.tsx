import { useQuery } from "@tanstack/react-query";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/client";
import { useAuthStore } from "../stores/authStore";

interface Order {
  id: string;
  total: number;
  estado: string;
}

export default function Pedidos() {
  const { user } = useAuthStore();

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
        };
      });
    },
    enabled: !!user,
  });

  if (isLoading) return <p>Cargando...</p>;
  if (orders.length === 0) return <p>No hay pedidos.</p>;

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-white text-center">Historial de Pedidos</h2>
      <ul className="space-y-4">
        {orders.map((order) => (
          <li key={order.id} className="text-white">
            <p>Pedido ID: {order.id}</p>
            <p>Total: ${order.total}</p>
            <p>Estado: {order.estado}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
