import "./Orders.css"
import { Link } from "react-router-dom";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import AccountGate from "../components/AccountGate/AccountGate";
import AccountSidebar from "../components/AccountSidebar/AccountSidebar";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getApiErrorMessage } from "../services/http";
import { getAccountOrders, type Order } from "../services/orders";
// 🚀 Importamos el servicio para crear reseñas y la llave de bloqueo
import { createCustomerReview } from "../services/reviews";

const REVIEWED_ORDERS_STORAGE_KEY = "my-favorite-rug-reviewed-orders";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.3-4.3" />
      <path d="M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z" />
    </svg>
  );
}

/* ==========================================================================
   MODAL DE RESEÑA REUTILIZABLE
   ========================================================================== */
function ReviewModal({ isOpen, onClose, customerName, orderId, productName, onSuccess }: { 
  isOpen: boolean; onClose: () => void; customerName: string; orderId: string | number; productName: string;
  onSuccess: (id: string | number) => void;
}) {
  const { t } = useLanguage();
  const [formMessage, setFormMessage] = useState("");

  useEffect(() => {
    if (!isOpen) return;

    const previousOverflow = document.body.style.overflow;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    const comment = String(formData.get("comment") ?? "").trim();
    const rating = Number(formData.get("rating") ?? 5);
    const productPhoto = formData.get("productPhoto");

    if (!comment) return;

    try {
      setFormMessage("");
      await createCustomerReview({
        name: customerName,
        rating,
        comment,
        productPhoto: productPhoto instanceof File && productPhoto.size > 0 ? productPhoto : undefined,
      });

      form.reset();
      setFormMessage(t("reviews.submitSuccess") || "¡Reseña enviada con éxito!");
      onSuccess(orderId); 

      setTimeout(() => {
        onClose();
        setFormMessage("");
      }, 2000);
    } catch {
      setFormMessage(t("reviews.submitError") || "Hubo un error al enviar la reseña.");
    }
  }

  return (
    <div className="review-modal-backdrop" onClick={onClose}>
      <div
        className="review-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="review-modal-title"
        onClick={(event) => event.stopPropagation()}
      >
        <button type="button" className="review-modal-close" onClick={onClose} aria-label="Cerrar modal">×</button>
        <form className="customer-review-form review-modal-form" onSubmit={handleSubmit}>
          <h3 id="review-modal-title" style={{ margin: 0, color: "#0c0a0b" }}>Opinar sobre {productName}</h3>
          <p style={{ fontSize: "12px", color: "#6d5c54", margin: 0 }}>Pedido N°: {orderId}</p>
          
          <label style={{ display: "grid", gap: "4px", fontSize: "13px", fontWeight: "bold" }}>
            <span>{t("reviews.rating") || "Calificación"}</span>
            <select name="rating" defaultValue="5" style={{ height: "40px", borderRadius: "6px", border: "1px solid var(--line)" }}>
              <option value="5">5 ⭐⭐⭐⭐⭐</option>
              <option value="4">4 ⭐⭐⭐⭐</option>
              <option value="3">3 ⭐⭐⭐</option>
              <option value="2">2 ⭐⭐</option>
              <option value="1">1 ⭐</option>
            </select>
          </label>

          <label style={{ display: "grid", gap: "4px", fontSize: "13px", fontWeight: "bold" }}>
            <span>{t("reviews.comment") || "Tu Comentario"}</span>
            <textarea name="comment" rows={4} maxLength={240} required style={{ padding: "10px", borderRadius: "6px", border: "1px solid var(--line)" }} />
          </label>

          <label style={{ display: "grid", gap: "4px", fontSize: "13px", fontWeight: "bold" }}>
            <span>{t("reviews.productPhoto") || "Foto del Producto"}</span>
            <input name="productPhoto" type="file" accept="image/*" />
          </label>

          {formMessage && <p className="customer-review-form-message" style={{ margin: 0, fontWeight: "bold" }}>{formMessage}</p>}
          <button type="submit" className="cart-secondary-link" style={{ minHeight: "46px", width: "100%", marginTop: "10px" }}>
            {t("reviews.submit") || "Enviar Opinión"}
          </button>
        </form>
      </div>
    </div>
  );
}

/* ==========================================================================
   COMPONENTE PRINCIPAL
   ========================================================================== */
export default function Orders() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  
  // Estados para controlar reseñas
  const [selectedOrder, setSelectedOrder] = useState<{ id: string|number; productName: string } | null>(null);
  const [reviewedOrders, setReviewedOrders] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem(REVIEWED_ORDERS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    getAccountOrders()
      .then(setOrders)
      .catch((error) => setLoadError(getApiErrorMessage(error, "No pudimos cargar tus pedidos. Intenta nuevamente.")))
      .finally(() => setIsLoading(false));
  }, []);

  function handleReviewSuccess(orderId: string | number) {
    setReviewedOrders((current) => {
      const nextList = [...current, orderId];
      localStorage.setItem(REVIEWED_ORDERS_STORAGE_KEY, JSON.stringify(nextList));
      return nextList;
    });
  }

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [order.orderNumber, order.id, order.status, order.shippingStatus]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [orders, search]);

  return (
    <AccountGate>
      {(user) => (
        <>
          <Navbar />

          <main className="account-list-page">
            <div className="account-shell">
              <AccountSidebar activeSection="orders" user={user} />

              <section className="account-content">
                <header className="account-list-heading">
                  <span>{t("account.area")}</span>
                  <h1>{t("account.orders")}</h1>
                  <p>{t("account.ordersHistory")}</p>
                </header>

                <label className="account-list-search">
                  <input
                    type="search"
                    placeholder={t("account.ordersSearch")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <SearchIcon />
                </label>

                {isLoading ? (
                  <section className="account-list-empty">
                    <p>Cargando tus pedidos...</p>
                  </section>
                ) : loadError ? (
                  <section className="account-list-empty">
                    <p>{loadError}</p>
                  </section>
                ) : filteredOrders.length > 0 ? (
                  <div className="tracking-list" style={{ display: "grid", gap: "16px" }}>
                    {filteredOrders.map((order) => {
                      const yaFueResenado = reviewedOrders.includes(order.id);

                      // 🚀 EXTRAEMOS LA IMAGEN DEL PRIMER PRODUCTO DE LA ORDEN
                      const productImageUrl = order.items && order.items.length > 0 && order.items[0].image
                        ? order.items[0].image
                        : "/assets/placeholder-rug.png";

                      const productNames = order.items && order.items.length > 0 
                        ? order.items.map((i: any) => i.name).join(", ") 
                        : "Alfombra";

                      const mainProductName = order.items && order.items.length > 0 
                        ? order.items[0].name 
                        : "Alfombra";

                      // 🚀 NUEVO: Declaramos la variable que le avisa a React si el pedido fue entregado
                      const isDelivered = 
                        order.status?.toLowerCase() === "entregado" || 
                        order.status?.toLowerCase() === "delivered" || 
                        order.shippingStatus?.toLowerCase() === "entregado";

                      return (
                        <article 
                          key={order.id}
                          style={{
                            display: "grid",
                            gridTemplateColumns: "90px 1fr auto",
                            gap: "20px",
                            alignItems: "center",
                            padding: "20px",
                            border: "1px solid var(--line)",
                            borderRadius: "12px",
                            background: "rgba(255, 250, 240, 0.5)",
                            boxShadow: "0 4px 14px rgba(71, 48, 21, 0.02)"
                          }}
                        >
                          {/* 📷 CONTENEDOR DE LA FOTO DEL PRODUCTO */}
                          <div style={{ width: "90px", height: "90px", borderRadius: "8px", overflow: "hidden", border: "1px solid var(--line)", backgroundColor: "#fff", display: "grid", placeItems: "center" }}>
                            <img src={productImageUrl} alt={mainProductName} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                          </div>

                           {/* 📝 DETALLES Y TEXTO DEL PEDIDO CORREGIDO MILIMÉTRICAMENTE */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            
                            {/* 1. N° Pedido Secuencial de Postgres */}
                            <strong style={{ fontSize: "15px", color: "#0c0a0b", margin: 0, fontWeight: "900" }}>
                              N° Pedido #{order.id}
                            </strong>
                            
                            {/* 2. Código de Seguimiento Interno de la Tienda (MFR-XXXXXX) */}
                            <span style={{ fontSize: "14px", color: "#6d5c54", fontWeight: "750" }}>
                              {order.orderNumber || `MFR-${order.id}`}
                            </span>
                            
                            {/* 3. Nombre de la Alfombra Comprada */}
                            <span style={{ fontSize: "15px", fontWeight: "1000", color: "var(--purple)" }}>
                              {productNames}
                            </span>
                            
                            {/* 4. Fecha de Compra */}
                            <p style={{ margin: 0, fontSize: "13px", color: "#6d5c54" }}>
                              {new Date(order.createdAt).toLocaleString("es-CL")}
                            </p>
                            
                            {/* 5. Unidades Traducidas Dinámicamente y Precio Final con IVA */}
                            <p style={{ margin: "2px 0 0 0", fontSize: "14px", fontWeight: "750" }}>
                              {order.items?.length || 1} {t("checkout.products")} · {formatPrice(order.total)}
                            </p>
                          </div>

                          {/* 🔘 COLUMNA DERECHA: ESTADO O ACCIÓN DE RESEÑA */}
                          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px" }}>
                            <span style={{ fontWeight: "1000", fontSize: "13px", textTransform: "uppercase", color: isDelivered ? "#2e7d32" : "#ef6c00" }}>
                              {order.shippingStatus || order.status}
                            </span>
                            
                            {/* Gatillador inteligente bilingüe si ya fue entregado */}
                            {isDelivered && (
                              yaFueResenado ? (
                                <span style={{ color: "#2e7d32", fontWeight: "bold", fontSize: "13px" }}>✓ Reseña Enviada</span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setSelectedOrder({ id: order.id, productName: mainProductName })}
                                  style={{ background: "var(--purple)", color: "#fff", border: "none", padding: "8px 14px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer", fontSize: "13px" }}
                                >
                                  Dejar Reseña
                                </button>
                              )
                            )}
                          </div>
                        </article>
                      );
                    })}
                  </div>
                ) : (
                  <section className="account-list-empty">
                    <p>{t("account.noOrders")}</p>
                    <Link to="/store" className="cart-secondary-link" style={{ display: "inline-block", marginTop: "12px" }}>
                      {t("account.startShopping") || t("cart.goStore")}
                    </Link>
                  </section>
                )}
              </section>
            </div>
          </main> {/* 👈 El MAIN ahora se cierra de forma correcta AQUÍ, aislando las tarjetas de arriba */}

          {/* 🚀 SOLUCIÓN DEFINITIVA: El Footer ahora queda libre abajo del todo, ocupando el 100% de la pantalla de fondo a fondo */}
          <Footer /> 

          <ReviewModal
            isOpen={Boolean(selectedOrder)}
            onClose={() => setSelectedOrder(null)}
            customerName={user.name}
            orderId={selectedOrder?.id || ""}
            productName={selectedOrder?.productName || ""}
            onSuccess={handleReviewSuccess}
          />
        </>
      )}
    </AccountGate>
  );
}
