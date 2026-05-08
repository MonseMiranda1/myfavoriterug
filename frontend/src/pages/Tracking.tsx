import AccountGate from "../components/AccountGate";
import AccountSidebar from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
import { getOrders } from "../services/orders";

export default function Tracking() {
  const { t } = useLanguage();

  return (
    <AccountGate>
      {(user) => {
        const orders = getOrders();

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
                          <span>{order.status}</span>
                          <p>{t("account.method")} {order.shippingMethod}</p>
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
