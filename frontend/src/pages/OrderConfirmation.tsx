import "./OrderConfirmation.css";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import {
  getOrderConfirmation,
  getOrders,
  type OrderConfirmation as OrderConfirmationData,
} from "../services/orders";

export default function OrderConfirmation() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("orderId");
  const localOrder = useMemo(
    () => getOrders().find((order) => String(order.id) === orderId) ?? getOrders()[0],
    [orderId],
  );
  const [confirmation, setConfirmation] = useState<OrderConfirmationData | null>(null);
  const [isLoading, setIsLoading] = useState(Boolean(orderId));
  const [loadFailed, setLoadFailed] = useState(false);

  useEffect(() => {
    if (!orderId) return;

    let cancelled = false;
    let refreshTimer: ReturnType<typeof setTimeout> | undefined;

    const loadConfirmation = async (attempt = 0) => {
      try {
        const nextConfirmation = await getOrderConfirmation(orderId);
        if (cancelled) return;

        setConfirmation(nextConfirmation);
        setLoadFailed(false);
        setIsLoading(false);

        if (nextConfirmation.paymentStatus === "PENDING" && attempt < 5) {
          refreshTimer = setTimeout(() => void loadConfirmation(attempt + 1), 2000);
        }
      } catch {
        if (!cancelled) {
          setLoadFailed(true);
          setIsLoading(false);
        }
      }
    };

    void loadConfirmation();

    return () => {
      cancelled = true;
      if (refreshTimer) clearTimeout(refreshTimer);
    };
  }, [orderId]);

  const displayedOrder = confirmation ?? (localOrder
    ? {
        orderId: Number(localOrder.id),
        orderNumber: localOrder.orderNumber ?? `#${localOrder.id}`,
        total: localOrder.total,
        orderStatus: localOrder.shippingStatus || localOrder.status,
        paymentStatus: null,
        paymentMethod: localOrder.paymentMethod,
        shippingMethod: localOrder.shippingMethod,
      }
    : null);
  const isFailed = confirmation?.paymentStatus === "FAILED";
  const isPending = confirmation?.paymentStatus === "PENDING";

  function statusLabel(status?: string | null) {
    if (!status) return language === "en" ? "Pending confirmation" : "Pendiente de confirmacion";

    const labels: Record<string, [string, string]> = {
      PAID: ["Pagado", "Paid"],
      PENDING: ["Pendiente", "Pending"],
      FAILED: ["Fallido", "Failed"],
      CONFIRMED: ["Confirmado", "Confirmed"],
      PENDING_PAYMENT: ["Pago pendiente", "Payment pending"],
      IN_PRODUCTION: ["En produccion", "In production"],
      SHIPPED: ["Enviado", "Shipped"],
      DELIVERED: ["Entregado", "Delivered"],
      CANCELLED: ["Cancelado", "Cancelled"],
    };

    return labels[status]?.[language === "en" ? 1 : 0] ?? status;
  }

  return (
    <>
      <Navbar />

      <main className="order-confirmation-page">
        <section className="order-confirmation-card">
          <div className={`order-confirmation-icon${isPending ? " is-pending" : ""}${isFailed ? " is-failed" : ""}`} aria-hidden="true">
            <svg viewBox="0 0 24 24">
              <path d={isFailed ? "M7 7l10 10M17 7 7 17" : isPending ? "M12 7v5l3 2" : "m5 12.5 4.2 4.2L19 7"} />
            </svg>
          </div>

          <div className="order-confirmation-copy">
            <span className="order-confirmation-kicker">{t("order.kicker")}</span>
            <h1>{isFailed ? t("order.failedTitle") : isPending ? t("order.pendingTitle") : t("order.title")}</h1>
            <p>
              {isLoading
                ? t("order.loading")
                : isFailed
                  ? t("order.failedText")
                  : isPending
                    ? t("order.pendingText")
                    : displayedOrder
                      ? `${t("order.received")} ${displayedOrder.orderNumber}. ${t("order.followup")}`
                      : t("order.confirmed")}
            </p>
          </div>

          {displayedOrder && (
            <div className="order-confirmation-summary">
              <div>
                <span>{t("order.number")}</span>
                <strong>{displayedOrder.orderNumber}</strong>
              </div>
              <div>
                <span>{t("order.status")}</span>
                <strong>{statusLabel(displayedOrder.orderStatus)}</strong>
              </div>
              <div>
                <span>{t("order.payment")}</span>
                <strong>{statusLabel(displayedOrder.paymentStatus)}</strong>
              </div>
              <div>
                <span>{t("common.total")}</span>
                <strong>
                  {new Intl.NumberFormat("es-CL", {
                    style: "currency",
                    currency: "CLP",
                    maximumFractionDigits: 0,
                  }).format(displayedOrder.total)}
                </strong>
              </div>
            </div>
          )}

          {loadFailed && !displayedOrder && <p className="order-confirmation-error">{t("order.notFound")}</p>}

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
