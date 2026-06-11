import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import creditIcon from "../assets/icons/credito.png";
import debitIcon from "../assets/icons/debito.png";
import paypalIcon from "../assets/icons/paypal.png";
import transferIcon from "../assets/icons/transferencia.png";

const paymentMethods = [
  { id: "debit", icon: debitIcon },
  { id: "credit", icon: creditIcon },
  { id: "paypal", icon: paypalIcon },
  { id: "transfer", icon: transferIcon },
] as const;

export default function PaymentMethods() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="payment-methods-page">
        <header className="payment-methods-heading">
          <span className="store-kicker">{t("paymentMethods.kicker")}</span>
          <h1>{t("paymentMethods.title")}</h1>
          <p>{t("paymentMethods.intro")}</p>
        </header>

        <section className="payment-methods-grid" aria-label={t("paymentMethods.title")}>
          {paymentMethods.map((method) => (
            <article className="payment-method-card" key={method.id}>
              <span className="payment-method-icon" aria-hidden="true">
                <img src={method.icon} alt="" />
              </span>
              <h2>{t(`paymentMethods.${method.id}.title` as never)}</h2>
              <p>{t(`paymentMethods.${method.id}.description` as never)}</p>
            </article>
          ))}
        </section>

        <p className="payment-methods-note">{t("paymentMethods.note")}</p>
      </main>
      <Footer />
    </>
  );
}
