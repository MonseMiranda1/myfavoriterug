import { useMemo, useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
import { getCartItems, saveCartItems } from "../services/cart";
import { saveOrder } from "../services/orders";

const TAX_RATE = 0.19;
const SHIPPING_PRICE = 4500;

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

export default function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [email, setEmail] = useState("");
  const [address, setAddress] = useState("");
  const [shippingMethod, setShippingMethod] = useState("Chilexpress");
  const [paymentMethod, setPaymentMethod] = useState("Transferencia");
  const items = useMemo(() => getCartItems(), []);
  const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);
  const tax = Math.round(subtotal * TAX_RATE);
  const total = subtotal + tax + SHIPPING_PRICE;
  const steps = [t("checkout.stepsData"), t("checkout.stepsShipping"), t("checkout.stepsSummary"), t("checkout.stepsPayment"), t("checkout.stepsConfirmation")];

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step < steps.length - 2) {
      setStep((current) => current + 1);
      return;
    }

    saveOrder({
      customerName,
      email,
      address,
      shippingMethod,
      paymentMethod,
      items,
      total,
    });
    saveCartItems([]);
    navigate("/orden-confirmada");
  }

  return (
    <>
      <Navbar />

      <main className="content-page checkout-page">
        <header className="store-heading">
          <span className="store-kicker">{t("checkout.kicker")}</span>
          <h1>{t("checkout.title")}</h1>
          <p>{t("checkout.subtitle")}</p>
        </header>

        <div className="checkout-steps" aria-label="Pasos del checkout">
          {steps.map((item, index) => (
            <span key={item} className={index <= step ? "is-active" : ""}>
              {item}
            </span>
          ))}
        </div>

        <form className="checkout-shell" onSubmit={handleSubmit}>
          <section className="checkout-panel">
            {step === 0 && (
              <>
                <h2>{t("checkout.customerData")}</h2>
                <label>
                  <span>{t("checkout.name")}</span>
                  <input required value={customerName} onChange={(event) => setCustomerName(event.target.value)} />
                </label>
                <label>
                  <span>{t("checkout.email")}</span>
                  <input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} />
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <h2>{t("checkout.shipping")}</h2>
                <label>
                  <span>{t("checkout.address")}</span>
                  <input required value={address} onChange={(event) => setAddress(event.target.value)} />
                </label>
                <label>
                  <span>{t("checkout.shippingMethod")}</span>
                  <select value={shippingMethod} onChange={(event) => setShippingMethod(event.target.value)}>
                    <option>Chilexpress</option>
                    <option>Starken</option>
                    <option>{t("checkout.pickup")}</option>
                    <option>{t("checkout.international")}</option>
                  </select>
                </label>
              </>
            )}

            {step === 2 && (
              <>
                <h2>{t("checkout.summary")}</h2>
                {items.length === 0 ? (
                  <p>{t("checkout.emptyCart")}</p>
                ) : (
                  <div className="checkout-items">
                    {items.map((item) => (
                      <div key={item.id}>
                        <span>{item.name} x {item.quantity}</span>
                        <strong>{formatPrice(item.price * item.quantity)}</strong>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {step === 3 && (
              <>
                <h2>{t("checkout.payment")}</h2>
                <label>
                  <span>{t("checkout.paymentMethod")}</span>
                  <select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}>
                    <option>{t("checkout.transfer")}</option>
                    <option>{t("checkout.card")}</option>
                    <option>PayPal</option>
                  </select>
                </label>
                <p>{t("checkout.paymentText")}</p>
              </>
            )}

            <div className="checkout-actions">
              {step > 0 && (
                <button type="button" className="cart-secondary-link" onClick={() => setStep((current) => current - 1)}>
                  {t("common.back")}
                </button>
              )}
              <button type="submit" className="btn btn-primary" disabled={items.length === 0}>
                {step === 3 ? t("checkout.confirm") : t("common.continue")}
              </button>
            </div>
          </section>

          <aside className="cart-summary">
            <h2>{t("common.total")}</h2>
            <div className="cart-summary-line"><span>{t("common.subtotal")}</span><strong>{formatPrice(subtotal)}</strong></div>
            <div className="cart-summary-line"><span>IVA</span><strong>{formatPrice(tax)}</strong></div>
            <div className="cart-summary-line"><span>{t("checkout.shipping")}</span><strong>{formatPrice(SHIPPING_PRICE)}</strong></div>
            <div className="cart-summary-total"><span>{t("common.total")}</span><strong>{formatPrice(total)}</strong></div>
          </aside>
        </form>
      </main>

      <Footer />
    </>
  );
}
