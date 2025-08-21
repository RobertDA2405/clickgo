// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../stores/authStore";
import { useCartStore } from "../stores/cartStore";
import ProductGrid from "../components/ProductGrid";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs, query, where, orderBy } from "firebase/firestore";
import { db } from "../firebase/client";

interface Promocion {
  id: string;
  titulo: string;
  imagen: string;
  activo: boolean;
  creadoEn: Date;
  orden?: number;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenes?: string[];
  categoria?: string;
}

// Fetch promociones
const fetchPromociones = async (): Promise<Promocion[]> => {
  const q = query(
    collection(db, "promociones"),
    where("activo", "==", true),
    orderBy("orden", "asc")
  );
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => {
    const data = doc.data();
    return {
      id: doc.id,
      titulo: data.titulo,
      imagen: data.imagen,
      activo: data.activo,
      creadoEn: data.creadoEn?.toDate ? data.creadoEn.toDate() : new Date(),
      orden: data.orden ?? 0,
    };
  });
};

// Fetch productos
const fetchProductos = async (): Promise<Producto[]> => {
  const snapshot = await getDocs(collection(db, "products"));
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as Producto[];
};

export default function Home() {
  const { user } = useAuthStore();
  const { items } = useCartStore();
  const [promoIndex, setPromoIndex] = useState(0);

  // React Query v5: queryKey y queryFn en objeto
  const { data: promociones = [] } = useQuery<Promocion[]>({
    queryKey: ["promociones"],
    queryFn: fetchPromociones,
  });

  const { data: productos = [] } = useQuery<Producto[]>({
    queryKey: ["productos"],
    queryFn: fetchProductos,
  });

  // Carrusel automático
  useEffect(() => {
    if (!promociones || promociones.length === 0) return;
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promociones.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promociones]);

  // Secciones de productos
  const productosDestacados = productos.slice(0, 4);
  const masVendidos = productos.slice(4, 8);
  const nuevosProductos = productos.slice(8, 12);

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Saludo y carrito */}
      <div className="max-w-7xl mx-auto px-4 py-4 text-center">
        {user ? (
          <p className="text-gray-800 font-semibold mb-2">¡Hola, {user.nombre}!</p>
        ) : (
          <p className="text-gray-800 font-semibold mb-2">
            <Link to="/cuenta" className="text-blue-600 hover:underline">
              Inicia sesión
            </Link>{" "}
            para una experiencia personalizada.
          </p>
        )}
        {items.length > 0 && (
          <p className="text-gray-700">
            Tienes {items.length} producto{items.length > 1 ? "s" : ""} en el carrito.
          </p>
        )}
      </div>

      {/* Hero Carousel */}
      {promociones.length > 0 && (
        <section className="max-w-7xl mx-auto my-6 overflow-hidden rounded-xl relative">
          <img
            src={promociones[promoIndex].imagen}
            alt={promociones[promoIndex].titulo}
            className="w-full h-64 sm:h-96 object-cover transition-all duration-700"
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white p-2 rounded">
            {promociones[promoIndex].titulo}
          </div>
        </section>
      )}

      {/* Secciones de Productos con scroll horizontal en móvil */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {[
          { titulo: "Destacados", items: productosDestacados },
          { titulo: "Más Vendidos", items: masVendidos },
          { titulo: "Nuevos Productos", items: nuevosProductos },
        ].map((seccion) => (
          <div key={seccion.titulo}>
            <h3 className="text-2xl font-bold mb-4 text-gray-800">{seccion.titulo}</h3>
            <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4">
              {seccion.items.map((producto) => (
                <div key={producto.id} className="flex-shrink-0 w-56">
                  <ProductGrid
                    products={[
                      {
                      ...producto,
                      imagenes: producto.imagenes ?? [],
                      },
                   ]}
                  />

                </div>
              ))}
            </div>
          </div>
        ))}
      </section>
    </div>
  );
}
