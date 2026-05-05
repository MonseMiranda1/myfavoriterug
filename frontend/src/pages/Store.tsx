import { useEffect, useState } from "react";
import { getProducts, type Product } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useSearchParams } from "react-router-dom";

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("buscar")?.trim().toLowerCase() ?? "";
  const filteredProducts = searchTerm
    ? products.filter((product) => product.name.toLowerCase().includes(searchTerm))
    : products;

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
  }, []);

  return (
    <>
      <Navbar />

      <div className="p-10">
        <h1 className="text-3xl font-bold mb-6">Tienda</h1>
        {searchTerm && (
          <p className="store-search-result">
            Resultados para <strong>{searchParams.get("buscar")}</strong>
          </p>
        )}

        <div className="grid grid-cols-4 gap-6">
          {filteredProducts.map((p) => (
            <Link to={`/producto/${p.id}`} key={p.id}>
              <div className="bg-white p-4 rounded-xl shadow">
                <img src={p.image} className="w-full h-40 object-cover" />
                <h2 className="font-bold mt-2">{p.name}</h2>
                <p className="text-orange-500">${p.price}</p>
              </div>
            </Link>
          ))}
        </div>

        {searchTerm && filteredProducts.length === 0 && (
          <p className="store-empty-result">No encontramos productos con esa busqueda.</p>
        )}
      </div>

      <Footer />
    </>
  );
}
