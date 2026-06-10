import { useMemo, useState, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getCartItems, saveCartItems } from "../services/cart";
import {
  createOrder,
  createPaymentIntent,
  saveOrder,
} from "../services/orders";

const SHIPPING_PRICE = 4500;
const BANK_TRANSFER_DETAILS = [
  ["Titular", "Monserrat Francisca Miranda Medina"],
  ["RUT", "186219813"],
  ["Banco", "Mercado Pago"],
  ["Tipo de cuenta", "Cuenta Vista"],
  ["Número de cuenta", "1014841261"],
  ["Correo", "veganrom@gmail.com"],
];

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
  const [paymentMethod, setPaymentMethod] = useState("FLOW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const items = useMemo(() => getCartItems(), []);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const total = subtotal + SHIPPING_PRICE;
  const steps = [
    t("checkout.stepsData"),
    t("checkout.stepsShipping"),
    t("checkout.stepsSummary"),
    t("checkout.stepsPayment"),
    t("checkout.stepsConfirmation"),
  ];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    if (step < steps.length - 2) {
      setStep((current) => current + 1);
      return;
    }

    const orderInput = {
      customerName,
      email,
      address,
      shippingMethod,
      paymentMethod,
      items,
      total,
    };

    try {
      setIsSubmitting(true);
      const order = await createOrder(orderInput);

      saveOrder(orderInput);
      saveCartItems([]);

      if (paymentMethod === "TRANSFERENCIA") {
        navigate("/orden-confirmada");
        return;
      }

      const payment = await createPaymentIntent(order.id, paymentMethod);

      if (payment.redirectUrl) {
        window.location.assign(payment.redirectUrl);
        return;
      }

      navigate("/orden-confirmada");
    } catch (error) {
      if (
        axios.isAxiosError<{ message?: string }>(error) &&
        error.response?.data?.message
      ) {
        setSubmitError(error.response.data.message);
      } else {
        setSubmitError(
          "No pudimos iniciar el pago. Revisa el backend o las credenciales de la pasarela.",
        );
      }
    } finally {
      setIsSubmitting(false);
    }
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
                  <input
                    required
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </label>
                <label>
                  <span>{t("checkout.email")}</span>
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>
              </>
            )}

            {step === 1 && (
              <>
                <h2>{t("checkout.shipping")}</h2>
                <label>
                  <span>{t("checkout.address")}</span>
                  <input
                    required
                    value={address}
                    onChange={(event) => setAddress(event.target.value)}
                  />
                </label>
                <label>
                  <span>{t("checkout.shippingMethod")}</span>
                  <select
                    value={shippingMethod}
                    onChange={(event) => setShippingMethod(event.target.value)}
                  >
                    <option>Correos de Chile</option>
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
                        <span>
                          {item.name} x {item.quantity}
                        </span>
                        <strong>
                          {formatPrice(item.price * item.quantity)}
                        </strong>
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
                  <select
                    value={paymentMethod}
                    onChange={(event) => setPaymentMethod(event.target.value)}
                  >
                    <option value="FLOW">Flow</option>
                    <option value="PAYPAL">PayPal</option>
                    <option value="TRANSFERENCIA">
                      {t("checkout.transfer")}
                    </option>
                  </select>
                </label>
                <p>{t("checkout.paymentText")}</p>
                {paymentMethod === "TRANSFERENCIA" && (
                  <div className="checkout-transfer-details" aria-label="Datos para transferencia">
                    <strong>Datos para transferencia</strong>
                    <dl>
                      {BANK_TRANSFER_DETAILS.map(([label, value]) => (
                        <div key={label}>
                          <dt>{label}</dt>
                          <dd>{value}</dd>
                        </div>
                      ))}
                    </dl>
                  </div>
                )}
                {submitError && <p className="custom-submit-message error">{submitError}</p>}
              </>
            )}

            <div className="checkout-actions">
              {step > 0 && (
                <button
                  type="button"
                  className="cart-secondary-link"
                  onClick={() => setStep((current) => current - 1)}
                >
                  {t("common.back")}
                </button>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={items.length === 0 || isSubmitting}
              >
                {step === 3
                  ? isSubmitting
                    ? "Abriendo portal..."
                    : "Pagar"
                  : t("common.continue")}
              </button>
            </div>
          </section>

          <aside className="cart-summary">
            <h2>{t("common.total")}</h2>
            <div className="cart-summary-line">
              <span>{t("common.subtotal")}</span>
              <strong>{formatPrice(subtotal)}</strong>
            </div>
            <div className="cart-summary-line">
              <span>{t("checkout.shipping")}</span>
              <strong>{formatPrice(SHIPPING_PRICE)}</strong>
            </div>
            <div className="cart-summary-total">
              <span>{t("common.total")}</span>
              <strong>{formatPrice(total)}</strong>
            </div>
          </aside>
        </form>
      </main>

      <Footer />
    </>
  );
}
