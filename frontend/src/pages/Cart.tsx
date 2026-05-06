import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { type CartItem, getCartItems, saveCartItems } from "../services/cart";
import { useEffect, useMemo, useState } from "react";

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
          <span className="cart-kicker">Tu seleccion</span>
          <h1>Carrito</h1>
          <p>Revisa tus alfombras antes de continuar con el pedido.</p>
        </header>

        {items.length === 0 ? (
          <section className="cart-empty">
            <h2>Tu carrito esta vacio</h2>
            <p>Explora la tienda o crea una alfombra personalizada para agregar productos.</p>
            <div>
              <Link to="/tienda" className="cart-primary-link">
                Ir a la tienda
              </Link>
              <Link to="/personaliza" className="cart-secondary-link">
                Personalizar
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
                    <span>Hecho a mano</span>

                    <div className="cart-price-grid">
                      <div>
                        <span>Precio</span>
                        <strong>{formatPrice(item.price)}</strong>
                      </div>
                      <div>
                        <span>IVA (19%)</span>
                        <strong>{formatPrice(Math.round(item.price * TAX_RATE))}</strong>
                      </div>
                      <div>
                        <span>Total</span>
                        <strong>{formatPrice(Math.round(item.price * (1 + TAX_RATE)) * item.quantity)}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="cart-item-actions">
                    <button type="button" className="cart-remove-button" onClick={() => removeItem(item.id)} aria-label={`Eliminar ${item.name}`}>
                      x
                    </button>
                    <div className="cart-quantity">
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity - 1)} aria-label="Restar cantidad">
                        -
                      </button>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(event) => updateQuantity(item.id, Number(event.target.value))}
                        aria-label={`Cantidad de ${item.name}`}
                      />
                      <button type="button" onClick={() => updateQuantity(item.id, item.quantity + 1)} aria-label="Sumar cantidad">
                        +
                      </button>
                    </div>
                  </div>
                </article>
              ))}

              <div className="cart-links-row">
                <button type="button" onClick={clearCart}>
                  Vaciar carrito
                </button>
                <Link to="/tienda">Seguir comprando</Link>
              </div>
            </section>

            <aside className="cart-summary" aria-label="Resumen del carrito">
              <h2>Resumen</h2>

              <div className="cart-summary-line">
                <span>Subtotal</span>
                <strong>{formatPrice(subtotal)}</strong>
              </div>
              <div className="cart-summary-line">
                <span>IVA (19%)</span>
                <strong>{formatPrice(tax)}</strong>
              </div>
              <div className="cart-summary-total">
                <span>Total</span>
                <strong>{formatPrice(total)}</strong>
              </div>

              {missingAmount > 0 && (
                <p className="cart-minimum-alert">
                  <strong>Minimo de compra:</strong> Te faltan {formatPrice(missingAmount)} para continuar.
                </p>
              )}

              <Link to="/checkout" className={`cart-checkout-button${missingAmount > 0 ? " is-disabled" : ""}`} aria-disabled={missingAmount > 0}>
                Continuar con el pedido
              </Link>

              <p className="cart-summary-note">
                Los valores son referenciales. El total definitivo puede variar por despacho o detalles de personalizacion.
              </p>
            </aside>
          </div>
        )}
      </main>

      <Footer />
    </>
  );
}
