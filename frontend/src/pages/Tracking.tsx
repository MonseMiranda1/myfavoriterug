import AccountGate from "../components/AccountGate/AccountGate";
import AccountSidebar from "../components/AccountSidebar/AccountSidebar";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getOrders, ORDERS_UPDATED_EVENT } from "../services/orders";
import { useEffect, useState } from "react";

export default function Tracking() {
  const { t } = useLanguage();
  const [orders, setOrders] = useState(getOrders());

  useEffect(() => {
    const refreshOrders = () => setOrders(getOrders());

    window.addEventListener(ORDERS_UPDATED_EVENT, refreshOrders);
    return () => window.removeEventListener(ORDERS_UPDATED_EVENT, refreshOrders);
  }, []);

  return (
    <AccountGate>
      {(user) => {
        return (
          <>
            <Navbar />
            <main className="account-page">
              <div className="account-shell">
                <AccountSidebar activeSection="tracking" user={user} />
                <section className="account-card">
                  <h2>{t("account.tracking")}</h2>
                  {orders.length === 0 ? (
                    <p>{t("account.noTracking")}</p>
                  ) : (
                    <div className="tracking-list">
                      {orders.map((order) => (
                        <article key={order.id}>
                          <strong>{order.id}</strong>
                          <span>{order.shippingStatus || order.status}</span>
                          <p>{t("account.method")} {order.shippingMethod}</p>
                          {order.trackingNumber && <p>Numero de seguimiento: <strong>{order.trackingNumber}</strong></p>}
                        </article>
                      ))}
                    </div>
                  )}
                </section>
              </div>
            </main>
            <Footer />
          </>
        );
      }}
    </AccountGate>
  );
}
