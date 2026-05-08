import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
import { getOrders } from "../services/orders";

export default function OrderConfirmation() {
  const { t } = useLanguage();
  const [latestOrder] = getOrders();

  return (
    <>
      <Navbar />

      <main className="content-page">
        <section className="content-article">
          <span className="store-kicker">{t("order.kicker")}</span>
          <h1>{t("order.title")}</h1>
          <p>
            {latestOrder
              ? `${t("order.received")} ${latestOrder.id}. ${t("order.followup")}`
              : t("order.confirmed")}
          </p>
          <Link to="/cuenta/seguimiento" className="cart-primary-link">{t("order.tracking")}</Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
