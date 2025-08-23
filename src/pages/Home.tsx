// src/pages/Home.tsx
import { useState, useEffect, useRef } from "react";
import { useQuery } from "@tanstack/react-query";
// Firestore is loaded lazily to keep the initial bundle small
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
    const { getDb } = await import('../firebase/lazyClient');
    const db = await getDb();
    const { collection, getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db as unknown as Parameters<typeof collection>[0], "promociones"));
    return snapshot.docs.map((doc) => ({ id: doc.id, ...(doc.data() as Omit<Promocion, "id">) }));
  };

  // Fetch productos
  const fetchProductos = async (): Promise<Producto[]> => {
    const { getDb } = await import('../firebase/lazyClient');
    const db = await getDb();
    const { collection, getDocs } = await import('firebase/firestore');
    const snapshot = await getDocs(collection(db as unknown as Parameters<typeof collection>[0], "products"));
    return snapshot.docs.map((doc) => {
      const data = doc.data() as Record<string, unknown>;
      return {
        id: doc.id,
        nombre: typeof data.nombre === 'string' ? data.nombre : '',
        precio: typeof data.precio === 'number' ? data.precio : (typeof data.precio === 'string' ? Number(data.precio) || 0 : 0),
        descripcion: typeof data.descripcion === 'string' ? data.descripcion : '',
        imagenes: Array.isArray(data.imagenes) ? data.imagenes.filter((i): i is string => typeof i === 'string') : [],
      } as Producto;
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

  // Rotar promociones automáticamente, con pausa en hover y soporte teclado
  const heroRef = useRef<HTMLDivElement | null>(null);
  const announcerRef = useRef<HTMLDivElement | null>(null);
  useEffect(() => {
    if (promociones.length === 0) return;
    let mounted = true;
    let paused = false;
    const interval = setInterval(() => {
      if (!paused && mounted) setPromoIndex((prev) => (prev + 1) % promociones.length);
    }, 5000);

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') setPromoIndex((p) => (p + 1) % promociones.length);
      if (e.key === 'ArrowLeft') setPromoIndex((p) => (p - 1 + promociones.length) % promociones.length);
    };

    const el = heroRef.current;
    const onEnter = () => { paused = true; };
    const onLeave = () => { paused = false; };
    window.addEventListener('keydown', onKey);
    el?.addEventListener('mouseenter', onEnter);
    el?.addEventListener('mouseleave', onLeave);

    return () => { mounted = false; window.removeEventListener('keydown', onKey); el?.removeEventListener('mouseenter', onEnter); el?.removeEventListener('mouseleave', onLeave); clearInterval(interval); };
  }, [promociones]);

  // Announce current slide to screen readers
  useEffect(() => {
    if (!announcerRef.current || promociones.length === 0) return;
    // Small timeout to ensure DOM update
    const t = setTimeout(() => {
      announcerRef.current!.textContent = `Promoción ${promoIndex + 1} de ${promociones.length}: ${promociones[promoIndex].titulo}`;
    }, 100);
    return () => clearTimeout(t);
  }, [promoIndex, promociones]);

  if (loadingPromo || loadingProd) {
    return (
      <div className="container-max py-8 content-pad">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Bienvenido a Click&Go</h1>
          <p className="text-gray-600">Explora nuestros productos y disfruta tu experiencia.</p>
        </div>
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-100 rounded-lg h-48"></div>
          ))}
        </div>
      </div>
    );
  }

  const productosDestacados = productos.slice(0, 4);
  const masVendidos = productos.slice(4, 8);
  const nuevosProductos = productos.slice(8, 12);

  return (
  <div className="container-max py-8 content-pad">
      <div className="text-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Bienvenido a Click&Go</h1>
        <p className="text-gray-600">Explora nuestros productos y disfruta tu experiencia.</p>
  <div className="mt-4">
          <a href="/catalogo" className="inline-block bg-yellow-500 hover:bg-yellow-600 text-gray-900 px-4 py-2 rounded font-semibold">Ver catálogo</a>
        </div>
      </div>

      {/* Hero Banner Promociones */}
      {promociones.length > 0 && (
        <div ref={heroRef} className="relative w-full h-64 mb-10 rounded-lg overflow-hidden shadow-lg" role="region" aria-roledescription="carousel" aria-label="Promociones">
          <img
            key={promociones[promoIndex].id + promoIndex}
            src={promociones[promoIndex].imagen}
            alt={promociones[promoIndex].titulo}
            className="w-full h-full object-cover hero-slide-enter"
            loading="lazy"
          />
          {/* Visually hidden live region for screen readers */}
          <div ref={announcerRef} className="sr-only" aria-live="polite" aria-atomic="true"></div>
          <div className="absolute bottom-0 left-0 p-4 bg-black bg-opacity-40 text-white w-full">
            <h3 className="text-xl font-bold">{promociones[promoIndex].titulo}</h3>
            <p className="text-sm">{promociones[promoIndex].descripcion}</p>
          </div>
          <div className="absolute top-2 right-2 flex gap-2">
            <button aria-label="Anterior" onClick={() => setPromoIndex((p) => (p - 1 + promociones.length) % promociones.length)} className="bg-white bg-opacity-60 hover:bg-opacity-80 rounded-full p-2">◀</button>
            <button aria-label="Siguiente" onClick={() => setPromoIndex((p) => (p + 1) % promociones.length)} className="bg-white bg-opacity-60 hover:bg-opacity-80 rounded-full p-2">▶</button>
          </div>
          <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex gap-2">
            {promociones.map((_, i) => (
              <button key={i} onClick={() => setPromoIndex(i)} aria-label={`Ir a slide ${i + 1}`} className={`w-2 h-2 rounded-full ${i === promoIndex ? 'bg-white' : 'bg-white bg-opacity-40'}`}></button>
            ))}
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
