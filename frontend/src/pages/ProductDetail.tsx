import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts, type Product } from "../services/api";
import Navbar from "../components/Navbar";
import { addCartItem } from "../services/cart";
import { useLanguage } from "../i18n";

export default function ProductDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);

  useEffect(() => {
    getProducts().then((res) => {
      const found = res.data.find((p) => String(p.id) === id);
      setProduct(found ?? null);
    });
  }, [id]);

  if (!product) return <p>{t("common.loading")}</p>;

  return (
    <>
      <Navbar />

      <div className="p-10 flex gap-10">
        <img src={product.image} className="w-96" />

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-orange-500 text-xl mt-2">
            ${product.price}
          </p>

          <button className="mt-6 bg-orange-500 text-white px-6 py-3 rounded" onClick={() => addCartItem(product)}>
            {t("product.addToCart")}
          </button>
        </div>
      </div>
    </>
  );
}
