import { FC } from 'react';

interface Order {
  id: string;
  userId: string;
  total: number;
  estado: string;
}

interface AdminOrderTableProps {
  orders: Order[];
}

const AdminOrderTable: FC<AdminOrderTableProps> = ({ orders }) => {
  return (
    <table className="w-full border-collapse">
      <thead>
        <tr className="bg-gray-200">
          <th className="p-2">ID</th>
          <th className="p-2">User</th>
          <th className="p-2">Total</th>
          <th className="p-2">Estado</th>
        </tr>
      </thead>
      <tbody>
        {orders.map((order) => (
          <tr key={order.id} className="border-b">
            <td className="p-2">{order.id}</td>
            <td className="p-2">{order.userId}</td>
            <td className="p-2">${order.total}</td>
            <td className="p-2">{order.estado}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default AdminOrderTable;