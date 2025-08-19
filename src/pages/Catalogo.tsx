
import { useQuery } from "@tanstack/react-query";
import { getProducts } from "../firebase/client";

const Catalogo = () => {
  const { data: products, isLoading, error } = useQuery({
    queryKey: ["products"],
    queryFn: getProducts
  });

  if (isLoading)
    return <p className="text-center mt-10 text-lg">Cargando productos...</p>;
  if (error)
    return (
      <p className="text-center mt-10 text-lg text-red-500">
        Error al cargar productos
      </p>
    );

  return (
    <div className="max-w-6xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-center mb-8">Catálogo ClickGo</h2>
      {products?.length === 0 ? (
        <p className="text-center text-lg">No hay productos disponibles.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product: any) => (
            <div
              key={product.id}
              className="border rounded-lg shadow-md p-4 hover:shadow-xl transition-shadow duration-300"
            >
              <div className="h-40 bg-gray-200 rounded-md mb-4 flex items-center justify-center">
                {/* Aquí puedes agregar imagen del producto si existe */}
                <span className="text-gray-500">Imagen</span>
              </div>
              <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
              <p className="text-gray-700 mb-2">${product.price}</p>
              <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 transition-colors">
                Comprar
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalogo;
