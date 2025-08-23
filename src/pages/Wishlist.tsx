import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useWishlistStore } from '../stores/wishlistStore';

type ProductSummary = {
  id: string;
  nombre: string;
  precio: number;
  imagenes?: string[];
  stock?: number;
};

export default function Wishlist() {
  const ids = useWishlistStore((s) => s.items);
  const remove = useWishlistStore((s) => s.remove);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [poppingId, setPoppingId] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!ids || ids.length === 0) { setProducts([]); return; }
    setLoading(true);
    (async () => {
      try {
        const { getProductById } = await import('../firebase/lazyClient');
        const reads = await Promise.all(ids.map(id => getProductById(id)));
        if (!mounted) return;
        const mapped = reads.filter(Boolean).map((p: unknown) => {
          const x = p as Record<string, unknown>;
          return { id: String(x.id), nombre: String(x.nombre), precio: typeof x.precio === 'number' ? x.precio : Number(x.precio ?? 0), imagenes: x.imagenes as string[] | undefined, stock: typeof x.stock === 'number' ? x.stock : undefined } as ProductSummary;
        });
        setProducts(mapped);
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => { mounted = false; };
  }, [ids]);

  if (loading) return <p className="text-center mt-8">Cargando favoritos...</p>;

  return (
    <div className="container-max mt-8">
      <h1 className="text-2xl font-bold mb-4">Mis Favoritos</h1>
      {ids.length === 0 ? (
        <div className="text-center text-gray-600">
          No tienes productos en favoritos. <Link to="/catalogo" className="text-yellow-600 underline">Explorar catálogo</Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map(p => (
            <div key={p.id} className="border rounded p-4 flex flex-col relative">
              <button
                onClick={() => { remove(p.id); setPoppingId(p.id); setTimeout(() => setPoppingId(null), 350); }}
                className={`heart-btn absolute top-3 right-3 ${poppingId === p.id ? 'heart-pop' : ''}`}
                aria-label="Eliminar de favoritos"
              >
                <svg viewBox="0 0 24 24" fill="#EF4444" aria-hidden>
                  <path d="M20.8 4.6c-1.5-1.4-3.9-1.4-5.4.1l-.9.8-.9-.8c-1.5-1.5-3.9-1.5-5.4-.1-1.6 1.5-1.7 4-.2 5.6l7.4 7.8 7.4-7.8c1.5-1.6 1.4-4.1-.2-5.6z" />
                </svg>
              </button>
              <Link to={`/producto/${encodeURIComponent(p.id)}`} className="block mb-3">
                <img src={p.imagenes?.[0] ?? '/vite.svg'} alt={p.nombre} className="w-full h-40 object-contain" />
              </Link>
              <div className="flex-1">
                <Link to={`/producto/${encodeURIComponent(p.id)}`} className="block"><h2 className="font-semibold">{p.nombre}</h2></Link>
                <p className="text-sm text-gray-700">${p.precio.toFixed(2)}</p>
              </div>
              <div className="mt-3 flex gap-2">
                <button className="btn btn-outline" onClick={() => remove(p.id)}>Eliminar</button>
                <Link to={`/producto/${encodeURIComponent(p.id)}`} className="btn btn-primary">Ver</Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
