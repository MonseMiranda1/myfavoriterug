import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";

const paymentMethods = [
  { id: "debit", symbol: "DB" },
  { id: "credit", symbol: "CR" },
  { id: "paypal", symbol: "PP" },
  { id: "transfer", symbol: "TR" },
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
              <span className="payment-method-icon" aria-hidden="true">{method.symbol}</span>
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
