import { Link, useLocation, useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { getProducts, type Product } from "../services/api";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { addCartItem } from "../services/cart";
import { useLanguage } from "../i18n";
import fallbackProductImage from "../assets/banner.png";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function ProductDetail() {
  const { t } = useLanguage();
  const { id } = useParams();
  const location = useLocation();
  const routeProduct = (location.state as { product?: Product } | null)
    ?.product;
  const [product, setProduct] = useState<Product | null>(
    () => routeProduct ?? null,
  );
  const [hasResolvedProduct, setHasResolvedProduct] = useState(
    Boolean(routeProduct),
  );
  const [productError, setProductError] = useState("");
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  useEffect(() => {
    setSelectedImageIndex(0);
    setProduct(routeProduct ?? null);
    setHasResolvedProduct(Boolean(routeProduct));
    setProductError("");

    getProducts()
      .then((res) => {
        const found = res.data.find((p) => String(p.id) === id);
        setProduct(found ?? routeProduct ?? null);
      })
      .catch((error) => {
        setProductError(
          error instanceof Error
            ? error.message
            : "No se pudo cargar el producto.",
        );
      })
      .finally(() => setHasResolvedProduct(true));
  }, [id, routeProduct]);

  if (!product) {
    return (
      <>
        <Navbar />
        <main className="product-detail-page">
          {!hasResolvedProduct ? (
            <section className="store-empty-result">
              <p>{t("common.loading")}</p>
            </section>
          ) : (
            <section className="store-empty-result">
              <p>{productError || t("store.empty")}</p>
              <Link to="/tienda">{t("nav.store")}</Link>
            </section>
          )}
        </main>
      </>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [product.image];
  const currentImage = images[selectedImageIndex] ?? images[0];
  const isQuoteProduct =
    product.availability === "Personalizado" || product.price === 0;
  const isAvailable =
    product.availability !== "Agotado" &&
    product.availability !== "Oculto" &&
    !isQuoteProduct;

  return (
    <>
      <Navbar />

      <main className="product-detail-page">
        <section className="product-detail-shell">
          <div className="product-gallery">
            <div className="product-main-image">
              <img
                src={currentImage || fallbackProductImage}
                alt={product.name}
                onError={(event) => {
                  event.currentTarget.src = fallbackProductImage;
                }}
              />
            </div>

            {images.length > 1 && (
              <div
                className="product-thumbnails"
                aria-label="Vistas del producto"
              >
                {images.map((img, index) => (
                  <button
                    type="button"
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={selectedImageIndex === index ? "is-active" : ""}
                    aria-label={`Ver imagen ${index + 1}`}
                  >
                    <img
                      src={img || fallbackProductImage}
                      alt=""
                      onError={(event) => {
                        event.currentTarget.src = fallbackProductImage;
                      }}
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <aside className="product-purchase-card">
            <span className="product-detail-kicker">
              {product.category || product.collection || t("nav.store")}
            </span>
            <h1>{product.name}</h1>
            <p className="product-detail-price">
              {isQuoteProduct ? (
                t("store.quote")
              ) : (
                <>
                  <span>{formatPrice(product.price)}</span>
                  <small>{t("store.netPrice")}</small>
                </>
              )}
            </p>
            {product.size && (
              <p className="product-detail-size">
                <span>{t("product.size")}</span>
                <strong>{product.size}</strong>
              </p>
            )}
            {product.availability && (
              <p className="product-detail-availability">
                {product.availability}
              </p>
            )}

            {isQuoteProduct ? (
              <Link to="/personaliza" className="product-add-button">
                {t("account.requestQuote")}
              </Link>
            ) : (
              <button
                type="button"
                className="product-add-button"
                onClick={() => addCartItem(product)}
                disabled={!isAvailable}
              >
                {t("product.addToCart")}
              </button>
            )}
          </aside>
        </section>
      </main>
      <Footer />
    </>
  );
}
