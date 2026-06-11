import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import AccountGate from "../components/AccountGate/AccountGate";
import AccountSidebar from "../components/AccountSidebar/AccountSidebar";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { updateAccountUser, type AccountUser } from "../services/accountAuth";
import { createCustomerReview } from "../services/reviews"; 

// 🔑 Llave única para guardar el registro en la memoria del navegador
const REVIEWED_ORDERS_STORAGE_KEY = "my-favorite-rug-reviewed-orders";

const stats = [
  { value: "0", labelKey: "account.totalOrders" },
  { value: "0", labelKey: "account.completedOrders" },
  { value: "0", labelKey: "account.totalQuotes" },
  { value: "$0", labelKey: "account.totalSpent" },
];

/* ==========================================================================
   COMPONENTE: MODAL DE RESEÑA
   ========================================================================== */
function ReviewModal({ isOpen, onClose, customerName, orderId, productName, onSuccess }: { 
  isOpen: boolean; onClose: () => void; customerName: string; orderId: string | number; productName: string;
  onSuccess: (id: string | number) => void;
}) {
  const { t } = useLanguage();
  const [formMessage, setFormMessage] = useState("");

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
      // Enviamos la reseña al backend de forma nativa
      await createCustomerReview({
        name: customerName,
        rating,
        comment,
        productPhoto: productPhoto instanceof File && productPhoto.size > 0 ? productPhoto : undefined,
      });

      form.reset();
      setFormMessage(t("reviews.submitSuccess") || "¡Reseña enviada con éxito!");
      
      // 🚀 Ejecutamos la función de éxito para bloquear el botón
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
    <div className="gallery-modal-backdrop" style={{ zIndex: 300 }}>
      <div className="gallery-modal-content" style={{ padding: "24px", background: "#fff", maxWidth: "450px" }}>
        <button type="button" className="gallery-modal-close" onClick={onClose}>×</button>
        <form className="customer-review-form" onSubmit={handleSubmit} style={{ display: "grid", gap: "14px" }}>
          <h3 style={{ margin: 0, color: "#0c0a0b" }}>Opinar sobre {productName}</h3>
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
   COMPONENTE DE PERFIL
   ========================================================================== */
function ProfileCard({ user, onUserUpdate }: { user: AccountUser; onUserUpdate: (user: AccountUser) => void }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formUser, setFormUser] = useState(user);
  const [message, setMessage] = useState("");
  const hasRut = Boolean(user.rut?.trim());

  useEffect(() => {
    if (!isEditing) {
      setFormUser(user);
    }
  }, [isEditing, user]);

  function updateField(field: keyof AccountUser, value: string) {
    setFormUser((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasRut && !formUser.rut.trim()) {
      setMessage("Ingresa tu RUT para completar el perfil.");
      return;
    }

    try {
      const savedUser = await updateAccountUser(formUser);
      onUserUpdate(savedUser);
      setMessage("");
      setIsEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    }
  }

  function handleCancel() {
    setFormUser(user);
    setMessage("");
    setIsEditing(false);
  }

  return (
    <article className="account-card account-profile-card">
      <div className="account-card-header">
        <h2>{t("account.personalInfo")}</h2>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)}>
            {t("account.edit")}
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="account-edit-form" onSubmit={handleSubmit}>
          <label>
            <span>{t("account.fullName")}</span>
            <input value={formUser.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={user.email} readOnly aria-readonly="true" className="account-locked-input" />
          </label>
          <label>
            <span>{t("account.phone")}</span>
            <input value={formUser.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            <span>RUT</span>
            <input
              value={hasRut ? user.rut : formUser.rut}
              onChange={(event) => updateField("rut", event.target.value)}
              readOnly={hasRut}
              aria-readonly={hasRut}
              className={hasRut ? "account-locked-input" : undefined}
              required={!hasRut}
            />
          </label>
          <label>
            <span>{t("account.address")}</span>
            <input value={formUser.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>

          <div className="account-edit-actions">
            {message && <strong className="account-login-error">{message}</strong>}
            <button type="button" onClick={handleCancel}>
              {t("account.cancel")}
            </button>
            <button type="submit">{t("account.save")}</button>
          </div>
        </form>
      ) : (
        <div className="account-info-grid">
          <div>
            <span>{t("account.fullName")}</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>{t("account.phone")}</span>
            <strong>{user.phone}</strong>
          </div>
          <div>
            <span>RUT</span>
            <strong>{hasRut ? user.rut : "Pendiente por completar"}</strong>
          </div>
          <div>
            <span>{t("account.address")}</span>
            <strong>{user.address}</strong>
          </div>
        </div>
      )}
    </article>
  );
}

/* ==========================================================================
   ESTRUCTURA PRINCIPAL DE LA CUENTA
   ========================================================================== */
function AccountContent({ sessionUser }: { sessionUser: AccountUser }) {
  const { t } = useLanguage();
  const [selectedOrder, setSelectedOrder] = useState<{ id: string|number; productName: string } | null>(null);
  
  // 🚀 CAMBIO REAL 1: Estado para guardar los pedidos reales traídos desde la API
  const [realOrders, setRealOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Cargamos el estado inicial de bloqueos desde el localStorage
  const [reviewedOrders, setReviewedOrders] = useState<(string | number)[]>(() => {
    const saved = localStorage.getItem(REVIEWED_ORDERS_STORAGE_KEY);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return [];
      }
    }
    return [];
  });

  // 🚀 CAMBIO REAL 2: Efecto para cargar los pedidos legítimos que reparó tu compañera
  useEffect(() => {
    import("../services/orders")
      .then((m) => m.getBackendOrders())
      .then((data) => {
        // Filtramos las órdenes en el frontend para asegurarnos de mostrar solo las de este cliente
        const myOrders = data.filter((order: any) => order.email === sessionUser.email);
        setRealOrders(myOrders);
      })
      .catch((err) => console.error("Error cargando órdenes reales:", err))
      .finally(() => setIsLoading(false));
  }, [sessionUser.email]);

  // Función que bloquea el botón y guarda el registro de forma permanente en el navegador
  function handleReviewSuccess(orderId: string | number) {
    setReviewedOrders((current) => {
      const nextList = [...current, orderId];
      localStorage.setItem(REVIEWED_ORDERS_STORAGE_KEY, JSON.stringify(nextList));
      return nextList;
    });
  }

  return (
    <>
      <Navbar />
      <main className="account-page">
        <header className="account-heading">
          <span className="account-kicker">{t("account.area")}</span>
          <h1>{t("account.myAccount")}</h1>
          <p>
            {t("account.welcome")} <strong>{sessionUser.name}</strong>
          </p>
        </header>

        <div className="account-shell">
          <AccountSidebar activeSection="profile" user={sessionUser} />

          <section className="account-content">
            <ProfileCard key={`${sessionUser.email}-${sessionUser.name}`} user={sessionUser} onUserUpdate={() => undefined} />
            
            <div className="account-card" style={{ marginTop: "24px" }}>
              <div className="account-card-header">
                <h2>{t("account.recentOrders")}</h2>
              </div>
              
              {isLoading ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}><p>Cargando tus pedidos...</p></div>
              ) : realOrders.length === 0 ? (
                <div style={{ textAlign: "center", padding: "32px 16px" }}>
                  <p>{t("account.noOrders")}</p>
                  <Link to="/store" className="cart-secondary-link" style={{ display: "inline-block", marginTop: "12px" }}>
                    {t("cart.goStore")}
                  </Link>
                </div>
              ) : (
                <div className="account-orders-list" style={{ display: "grid", gap: "16px" }}>
                  {realOrders.map((order) => {
                    const yaFueResenado = reviewedOrders.includes(order.id);
                    
                    // 🚀 CAMBIO REAL 3: Como 'items' es un arreglo ([]) según orders.ts, 
                    // obtenemos los nombres de los productos comprados separados por coma.
                    const productNames = order.items && order.items.length > 0 
                      ? order.items.map((i: any) => i.name).join(", ") 
                      : "Alfombra";

                    // Tomamos el primer nombre de producto principal para guardarlo en la reseña
                    const mainProductName = order.items && order.items.length > 0 
                      ? order.items[0].name 
                      : "Alfombra";

                    return (
                      <div key={order.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px", border: "1px solid var(--line)", borderRadius: "8px", background: "rgba(255, 250, 240, 0.5)" }}>
                        <div>
                          <strong style={{ display: "block" }}>Pedido #{order.id}</strong>
                          <span style={{ fontSize: "14px", color: "#40342e" }}>{productNames}</span>
                          <small style={{ display: "block", marginTop: "4px", fontWeight: "bold", color: (order.status === "Entregado" || order.shippingStatus === "Entregado") ? "#2e7d32" : "#ef6c00" }}>
                            Estado: {order.shippingStatus || order.status}
                          </small>
                        </div>
                        {/* Verificación flexible de estado en base a lo mapeado en orders.ts */}
                        {(order.status?.toLowerCase() === "entregado" || 
                          order.status?.toLowerCase() === "delivered" || 
                          order.shippingStatus?.toLowerCase() === "entregado") && (
                          yaFueResenado ? (
                            <span style={{ color: "#2e7d32", fontWeight: "bold", fontSize: "14px", padding: "8px 16px" }}>✓ Reseña Enviada</span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setSelectedOrder({ id: order.id, productName: mainProductName })}
                              style={{ background: "var(--purple)", color: "#fff", border: "none", padding: "8px 16px", borderRadius: "6px", fontWeight: "bold", cursor: "pointer" }}
                            >
                              Dejar Reseña
                            </button>
                          )
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="account-stats-grid" style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
              {stats.map((stat, idx) => (
                <div key={idx} className="account-stat-card" style={{ padding: "16px", border: "1px solid var(--line)", borderRadius: "8px", textAlign: "center" }}>
                  <div className="account-stat-value" style={{ fontSize: "28px", fontWeight: "bold", color: "var(--purple)" }}>{stat.value}</div>
                  <div className="account-stat-label" style={{ fontSize: "14px", color: "#6d5c54" }}>{t(stat.labelKey as never)}</div>
                </div>
              ))}
            </div>

            {/* 5. Renderizado condicional del modal de reseña */}
            <ReviewModal
              isOpen={Boolean(selectedOrder)}
              onClose={() => setSelectedOrder(null)}
              customerName={sessionUser.name}
              orderId={selectedOrder?.id || ""}
              productName={selectedOrder?.productName || ""}
              onSuccess={handleReviewSuccess}
            />
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}

// Este es el componente principal que exporta la página y usa AccountGate y AccountContent
export default function Account() {
  return (
    <AccountGate>
      {(sessionUser) => <AccountContent sessionUser={sessionUser} />}
    </AccountGate>
  );
}