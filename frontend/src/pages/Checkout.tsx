import "./Checkout.css";
import { useMemo, useState, useEffect, type FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getCartItems, saveCartItems } from "../services/cart";
import { getAccountUser } from "../services/accountAuth";
import {
  createOrder,
  createPaymentIntent,
  saveOrder,
} from "../services/orders";
// 1. Importamos el hook nativo de Zustand desde tu servicio
import { useAccountAuthStore } from "../services/accountAuth"; 

const SHIPPING_PRICE = 4500;
const PICKUP_METHODS = ["Retiro coordinado", "Coordinated pickup"];
const BANK_TRANSFER_DETAILS = [
  ["Titular", "Monserrat Francisca Miranda Medina"],
  ["RUT", "18.621.981-3"],
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

function validarRutOPasaporte(input: string): { isValid: boolean; isRut: boolean } {
  // Limpiamos sacando espacios, puntos y guiones, y pasamos a mayúsculas
  const cleanStr = input.replace(/[\s.-]/g, "").toUpperCase();
  
  // Rango general de largo aceptado para cualquier documento
  if (cleanStr.length < 6 || cleanStr.length > 15) {
    return { isValid: false, isRut: false };
  }

  // 1. Identificamos si tiene la estructura de un RUT chileno
  // (un cuerpo numérico de 7 u 8 dígitos, más un dígito verificador que es un número o una K)
  const esFormatoRut = /^\d{7,8}[0-9K]$/.test(cleanStr);

  if (esFormatoRut) {
    const cuerpo = cleanStr.slice(0, -1);
    const dvIngresado = cleanStr.slice(-1);

    // Calcular dígito verificador esperado (Algoritmo Módulo 11)
    let suma = 0;
    let multiplicador = 2;

    for (let i = cuerpo.length - 1; i >= 0; i--) {
      suma += parseInt(cuerpo[i], 10) * multiplicador;
      multiplicador = multiplicador === 7 ? 2 : multiplicador + 1;
    }

    const dvEsperadoId = 11 - (suma % 11);
    let dvEsperado = dvEsperadoId === 11 ? "0" : dvEsperadoId === 10 ? "K" : dvEsperadoId.toString();

    // Si coincide el dígito, es un RUT chileno auténtico
    if (dvIngresado === dvEsperado) {
      return { isValid: true, isRut: true };
    }

    // Un DNI numérico puede coincidir con la estructura de un RUT sin compartir
    // su dígito verificador, por lo que se acepta como documento internacional.
    return { isValid: true, isRut: false };
  }

  // 2. Si no tiene forma de RUT chileno, comprobamos si calza como pasaporte internacional
  // (Permite mezclar letras y números de manera libre)
  const pasaporteRegex = /^[A-Z0-9]{6,15}$/;
  if (pasaporteRegex.test(cleanStr)) {
    return { isValid: true, isRut: false };
  }

  return { isValid: false, isRut: false };
}

export default function Checkout() {
  const { t } = useLanguage();
  const navigate = useNavigate();
  
  // 2. Traemos al usuario logueado desde el estado global de Zustand
  const user = useAccountAuthStore((state) => state.user);

  const [step, setStep] = useState(0);
  const accountUser = getAccountUser();
  const [customerName, setCustomerName] = useState(accountUser?.name ?? "");
  const [email, setEmail] = useState(accountUser?.email ?? "");
  const [phone, setPhone] = useState(accountUser?.phone ?? "");
  const [rut, setRut] = useState(accountUser?.rut ?? "");
  const [address, setAddress] = useState(accountUser?.address ?? "");
  const [shippingMethod, setShippingMethod] = useState("Chilexpress");
  const [paymentMethod, setPaymentMethod] = useState("FLOW");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const items = useMemo(() => getCartItems(), []);
  const subtotal = items.reduce(
    (total, item) => total + item.price * item.quantity,
    0,
  );
  const shippingPrice = PICKUP_METHODS.includes(shippingMethod) ? 0 : SHIPPING_PRICE;
  const total = subtotal + shippingPrice;
  const steps = [
    t("checkout.stepsData"),
    t("checkout.stepsShipping"),
    t("checkout.stepsSummary"),
    t("checkout.stepsPayment"),
    t("checkout.stepsConfirmation"),
  ];

  // 3. Efecto inteligente: Si hay un usuario, rellena los campos al cargar.
  // Si no hay nadie (Invitado), los deja vacíos para que escriban.
  useEffect(() => {
    if (user) {
      if (user.name) setCustomerName(user.name);
      if (user.email) setEmail(user.email);
      if (user.phone) setPhone(user.phone);     // 👈 Autocompleta Teléfono
      if (user.rut) setRut(user.rut);
      if (user.address) setAddress(user.address); // ¡Bonus! Autocompleta la dirección del paso 1
    }
  }, [user]); // Reacciona de inmediato si el estado del usuario cambia

 async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");

    // Validaciones estrictas en el primer paso (Paso 0)
    if (step === 0) {
      if (!customerName.trim()) {
        setSubmitError("Por favor, ingresa tu nombre completo.");
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        setSubmitError("El correo electrónico no es válido. Por favor, revísalo.");
        return;
      }

      if (!phone.trim()) {
        setSubmitError("Por favor, ingresa un número de teléfono de contacto.");
        return;
      }

      // 🛡️ Validación inteligente de RUT / Pasaporte
      const chequeoDocumento = validarRutOPasaporte(rut);
      if (!chequeoDocumento.isValid) {
        setSubmitError("El RUT, DNI o Pasaporte ingresado no es válido. Por favor, verifícalo.");
        return;
      }
    }

    // Si pasa el paso actual y no es el último, avanza de pestaña
    if (step < steps.length - 2) {
      setStep((current) => current + 1);
      return;
    }

    const orderInput = {
      customerName,
      email,
      phone,   // 👈 Añadido para el backend
      rut,    // 👈 Añadido para el backend
      address,
      shippingMethod,
      paymentMethod,
      items,
      total,
    };

    try {
      setIsSubmitting(true);
      const order = await createOrder(orderInput);

      saveOrder(order);
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
                
                {/* 👤 Campo Nombre Bilingüe */}
                <label>
                  <span>{t("checkout.name")}</span>
                  <input
                    required
                    placeholder={t("checkout.namePlaceholder")}
                    value={customerName}
                    onChange={(event) => setCustomerName(event.target.value)}
                  />
                </label>

                {/* ✉️ Campo Correo Bilingüe */}
                <label>
                  <span>{t("checkout.email")}</span>
                  <input
                    required
                    type="email"
                    placeholder={t("checkout.emailPlaceholder")}
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                  />
                </label>

                {/* 📞 Campo Teléfono Bilingüe */}
                <label>
                  <span>{t("checkout.phone")}</span>
                  <input
                    required
                    type="tel"
                    placeholder={t("checkout.phonePlaceholder")}
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                  />
                </label>

                {/* 🪪 Campo RUT / Pasaporte Bilingüe */}
                <label>
                  <span>{t("checkout.document")}</span>
                  <input
                    required
                    placeholder={t("checkout.documentPlaceholder")}
                    value={rut}
                    onChange={(event) => setRut(event.target.value)}
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
                    placeholder="Dirección, número, Comuna, Provincia, País"
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
                
                {/* 📋 Bloque bilingüe de verificación de datos del cliente */}
                <div className="checkout-customer-verification" style={{ marginBottom: '25px', padding: '20px', border: '1px solid var(--line)', borderRadius: '6px', backgroundColor: '#f9f9f9' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem' }}>{t("checkout.orderData")}</h3>
                  <div style={{ display: 'grid', gap: '8px', fontSize: '0.95rem' }}>
                    <p style={{ margin: 0 }}>👤 <strong>{t("checkout.name")}:</strong> {customerName}</p>
                    <p style={{ margin: 0 }}>🪪 <strong>{t("checkout.document")?.split(" ")[0] || "RUT"}:</strong> {rut || "No ingresado"}</p>
                    <p style={{ margin: 0 }}>✉️ <strong>{t("checkout.email")}:</strong> {email}</p>
                    <p style={{ margin: 0 }}>📞 <strong>{t("checkout.phone")}:</strong> {phone || "No ingresado"}</p>
                    <p style={{ margin: 0 }}>📍 <strong>{t("checkout.shippingAddress")}:</strong> {address || "No ingresada"}</p>
                    <p style={{ margin: 0 }}>🚚 <strong>{t("checkout.shippingMethodLabel")}:</strong> {shippingMethod}</p>
                  </div>
                </div>

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
                {/* 🗑️ ELIMINAR DE AQUÍ: Borra la línea de submitError que estaba en este paso */}
              </>
            )}

            {/* 🚨 UBICACIÓN GLOBAL RECOMENDADA: El error ahora se renderiza fuera de los pasos condicionales */}
            {submitError && (
              <p className="custom-submit-message error" style={{ margin: "10px 0 0 0" }}>
                {submitError}
              </p>
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
              <strong>{formatPrice(shippingPrice)}</strong>
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
