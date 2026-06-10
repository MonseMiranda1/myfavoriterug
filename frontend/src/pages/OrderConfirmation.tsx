import "./OrderConfirmation.css";
import { Link } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getOrders } from "../services/orders";

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const [latestOrder] = getOrders();

  return (
    <>
      <Navbar />

      <main className="order-confirmation-page">
        <section className="order-confirmation-card">
          <div className="order-confirmation-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d="m5 12.5 4.2 4.2L19 7" />
            </svg>
          </div>

          <div className="order-confirmation-copy">
            <span className="order-confirmation-kicker">{t("order.kicker")}</span>
            <h1>{t("order.title")}</h1>
            <p>
              {latestOrder
                ? `${t("order.received")} ${latestOrder.orderNumber ?? `#${latestOrder.id}`}. ${t("order.followup")}`
                : t("order.confirmed")}
            </p>
          </div>

          {latestOrder && (
            <div className="order-confirmation-summary">
              <div>
                <span>Número de pedido</span>
                <strong>{latestOrder.orderNumber ?? `#${latestOrder.id}`}</strong>
              </div>
              <div>
                <span>Estado</span>
                <strong>{latestOrder.shippingStatus || latestOrder.status}</strong>
              </div>
              <div>
                <span>Total</span>
                <strong>
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    maximumFractionDigits: 0,
                  }).format(latestOrder.total)}
                </strong>
              </div>
            </div>
          )}

          <div className="order-confirmation-actions">
            <Link to="/cuenta/seguimiento" className="order-confirmation-primary">
              {t("order.tracking")}
            </Link>
            <Link to="/tienda" className="order-confirmation-secondary">
              {t("cart.goStore")}
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
