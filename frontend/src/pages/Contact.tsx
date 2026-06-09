import { type FormEvent, useState } from "react";
import { Link } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import instagramIcon from "../assets/icons/instagram.png";
import { useLanguage } from "../i18n";

export default function Contact() {
  const { t } = useLanguage();
  const [sent, setSent] = useState(false);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(true);
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
          <form className="contact-form" onSubmit={handleSubmit}>
            <label>
              <span>{t("contact.name")}</span>
              <input required type="text" />
            </label>
            <label>
              <span>{t("contact.email")}</span>
              <input required type="email" />
            </label>
            <label>
              <span>{t("contact.message")}</span>
              <textarea required rows={6} />
            </label>
            <button type="submit" className="btn btn-primary">{t("contact.submit")}</button>
            {sent && <p className="custom-submit-message success">{t("contact.sent")}</p>}
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
