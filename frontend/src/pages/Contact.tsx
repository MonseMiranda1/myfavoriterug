import { type FormEvent, useState, useRef } from "react";
import { Link } from "react-router-dom";
import emailjs from "@emailjs/browser";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import instagramIcon from "../assets/icons/instagram.png";
import { useLanguage } from "../i18n";

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  //credenciales de EmailJS
  const SERVICE_ID = "service_0k7xjbt";
  const TEMPLATE_ID = "template_xr8uq9k";
  const PUBLIC_KEY = "ATFlcTAe7uju91qPd";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(false);

    try {
      await emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, formRef.current!, PUBLIC_KEY);
      setSent(true);
      formRef.current?.reset();
      setTimeout(() => setSent(false), 5000);
    } catch {
      setError(true);
      setTimeout(() => setError(false), 5000);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <Navbar />

      <main className="content-page">
        <header className="store-heading">
          <span className="store-kicker">{t("contact.kicker")}</span>
          <h1>{t("contact.title")}</h1>
          <p>{t("contact.subtitle")}</p>
        </header>

        <div className="contact-shell">
          <form ref={formRef} className="contact-form" onSubmit={handleSubmit}>
            <label>
              <span>{t("contact.name")}</span>
              <input required type="text" name="user_name" />
            </label>
            <label>
              <span>{t("contact.email")}</span>
              <input required type="email" name="user_email" />
            </label>
            <label>
              <span>{t("contact.message")}</span>
              <textarea required rows={6} name="message" />
            </label>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Enviando..." : t("contact.submit")}
            </button>
            {sent && <p className="custom-submit-message success">{t("contact.sent")}</p>}
            {error && <p className="custom-submit-message error">Error al enviar. Intenta nuevamente.</p>}
          </form>

          <aside className="contact-card">
            <a href="https://instagram.com/myfavoriterug" target="_blank" rel="noreferrer">
              <img src={instagramIcon} alt="" />
              Instagram
            </a>
            <Link to="/envios">{t("contact.shippingInfo")}</Link>
            <Link to="/terminos">{t("contact.terms")}</Link>
          </aside>
        </div>
      </main>

      <Footer />
    </>
  );
}
