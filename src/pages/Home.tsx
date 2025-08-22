// src/pages/Home.tsx
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/client";
import ProductGrid from "../components/ProductGrid";

interface Promocion {
  id: string;
  titulo: string;
  descripcion: string;
  imagen: string;
}

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  descripcion: string;
  imagenes: string[];
}

export default function Home() {
  const [promoIndex, setPromoIndex] = useState(0);

  // Fetch promociones
  const fetchPromociones = async (): Promise<Promocion[]> => {
    const snapshot = await getDocs(collection(db, "promociones"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Promocion, "id">) }));
  };

  // Fetch productos
  const fetchProductos = async (): Promise<Producto[]> => {
    const snapshot = await getDocs(collection(db, "products"));
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        nombre: data.nombre,
        precio: data.precio,
        descripcion: data.descripcion,
        imagenes: data.imagenes ?? [],
      };
    });
  };

  const { data: promociones = [], isLoading: loadingPromo } = useQuery<Promocion[]>({
    queryKey: ["promociones"],
    queryFn: fetchPromociones,
  });

  const { data: productos = [], isLoading: loadingProd } = useQuery<Producto[]>({
    queryKey: ["productos"],
    queryFn: fetchProductos,
  });

  // Rotar promociones automáticamente
  useEffect(() => {
    if (promociones.length === 0) return;
    const interval = setInterval(() => {
      setPromoIndex((prev) => (prev + 1) % promociones.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [promociones]);

  if (loadingPromo || loadingProd) {
    return <p className="text-center text-gray-600 mt-10">Cargando...</p>;
  }

  const productosDestacados = productos.slice(0, 4);
  const masVendidos = productos.slice(4, 8);
  const nuevosProductos = productos.slice(8, 12);

  return (
  <div className="container-max py-8">
      {/* Hero Banner Promociones */}
      {promociones.length > 0 && (
        <div className="relative w-full h-64 mb-10 rounded-lg overflow-hidden shadow-lg">
          <img
            src={promociones[promoIndex].imagen}
            alt={promociones[promoIndex].titulo}
            className="w-full h-full object-cover"
          />
          <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-40 text-white w-full">
            <h3 className="text-xl font-bold">{promociones[promoIndex].titulo}</h3>
            <p className="text-sm">{promociones[promoIndex].descripcion}</p>
          </div>
        </div>
      )}

      {/* Secciones de productos */}
      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Productos Destacados</h2>
        <ProductGrid products={productosDestacados} />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Más Vendidos</h2>
        <ProductGrid products={masVendidos} />
      </section>

      <section className="mb-10">
        <h2 className="text-2xl font-bold mb-4 text-gray-900">Nuevos Productos</h2>
        <ProductGrid products={nuevosProductos} />
      </section>
    </div>
  );
}
