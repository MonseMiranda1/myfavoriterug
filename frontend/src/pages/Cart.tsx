import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { type CartItem, getCartItems, saveCartItems } from "../services/cart";
import { useEffect, useMemo, useState } from "react";
import { useLanguage } from "../i18n";

const MINIMUM_ORDER = 15000;
const TAX_RATE = 0.19;

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

function getSubtotal(items: CartItem[]) {
  return items.reduce((total, item) => total + item.price * item.quantity, 0);
}

export default function Cart() {
  const { t } = useLanguage();
  const [items, setItems] = useState<CartItem[]>([]);
  const subtotal = useMemo(() => getSubtotal(items), [items]);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax;
  const missingAmount = Math.max(MINIMUM_ORDER - total, 0);

  useEffect(() => {
    setItems(getCartItems());
  }, []);

  function updateItems(nextItems: CartItem[]) {
    setItems(nextItems);
    saveCartItems(nextItems);
  }

  function updateQuantity(id: CartItem["id"], quantity: number) {
    const nextQuantity = Math.max(1, quantity);
    updateItems(items.map((item) => (String(item.id) === String(id) ? { ...item, quantity: nextQuantity } : item)));
  }

  function removeItem(id: CartItem["id"]) {
    updateItems(items.filter((item) => String(item.id) !== String(id)));
  }

  function clearCart() {
    updateItems([]);
  }

  return (
    <>
      <Navbar />

      <main className="cart-page">
        <header className="cart-heading">
          <span className="cart-kicker">{t("cart.kicker")}</span>
          <h1>{t("cart.title")}</h1>
          <p>{t("cart.subtitle")}</p>
        </header>

        {items.length === 0 ? (
          <section className="cart-empty">
            <h2>{t("cart.emptyTitle")}</h2>
            <p>{t("cart.emptyText")}</p>
            <div>
              <Link to="/tienda" className="cart-primary-link">
                {t("cart.goStore")}
              </Link>
              <Link to="/personaliza" className="cart-secondary-link">
                {t("cart.customize")}
              </Link>
            </div>
          </section>
        ) : (
          <div className="cart-shell">
            <section className="cart-items" aria-label="Productos del carrito">
              {items.map((item) => (
                <article className="cart-item" key={item.id}>
                  <img src={item.image} alt={item.name} />

                  <div className="cart-item-info">
                    <strong>{item.name}</strong>
                    <span>SKU: MFR-{item.id}</span>
                    <span>{t("cart.handmade")}</span>

                    <div className="cart-price-grid">
                      <div>
                        <span>{t("cart.price")}</span>
                        <strong>{formatPrice(item.price)}</strong>
                      </div>
                      <div>
                        <span>{t("cart.tax")}</span>
                        <strong>{formatPrice(Math.round(item.price * TAX_RATE))}</strong>
                      </div>
                      <div>
                        <span>{t("common.total")}</span>
                        <strong>{formatPrice(Math.round(item.price * (1 + TAX_RATE)) * item.quantity)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button type="button" className="cart-remove-button" onClick={() => removeItem(item.id)} aria-label={`${t("cart.remove")} ${item.name}`}>
                      x
                    </button>
                    <div className="cart-quantity">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label={t("cart.subtract")}>
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                        aria-label={`Cantidad de ${item.name}`}
                      />
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label={t("cart.add")}>
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <div className="cart-links-row">
                <button type="button" onClick={clearCart}>
                  {t("cart.clear")}
                </button>
                <Link to="/tienda">{t("cart.keepShopping")}</Link>
              </div>
            </section>

            <aside className="cart-summary" aria-label="Resumen del carrito">
              <h2>{t("cart.summary")}</h2>

              <div className="cart-summary-line">
                <span>{t("common.subtotal")}</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="cart-summary-line">
                <span>{t("cart.tax")}</span>
                <strong>{formatPrice(tax)}</strong>
              </div>
              <div className="cart-summary-total">
                <span>{t("common.total")}</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              {missingAmount > 0 && (
                <p className="cart-minimum-alert">
                  <strong>{t("cart.minimum")}</strong> {t("cart.missing")} {formatPrice(missingAmount)} {t("cart.toContinue")}
                </p>
              )}

              <Link to="/checkout" className={`cart-checkout-button${missingAmount > 0 ? " is-disabled" : ""}`} aria-disabled={missingAmount > 0}>
                {t("cart.checkout")}
              </Link>

              <p className="cart-summary-note">
                {t("cart.note")}
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
