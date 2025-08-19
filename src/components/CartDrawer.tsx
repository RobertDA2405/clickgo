import { FC, useState } from 'react';

const CartDrawer: FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  // Aquí integra useCart hook después

  return (
    <div>
      <button onClick={() => setIsOpen(true)} className="bg-green-500 text-white px-4 py-2 rounded">
        Carrito
      </button>
      {isOpen && (
        <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-lg p-4">
          <button onClick={() => setIsOpen(false)} className="text-red-500 mb-4">Cerrar</button>
          <h2 className="text-xl font-bold mb-4">Tu Carrito</h2>
          {/* Items del carrito aquí */}
          <p>Subtotal: $0.00</p>
        </div>
      )}
    </div>
  );
};

export default CartDrawer;