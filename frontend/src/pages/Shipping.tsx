import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";

export default function Shipping() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="content-page shipping-page">
        <article className="content-article">
          <span className="store-kicker">{t("shipping.kicker")}</span>

          {/* Contenedor de las columnas */}

          <div className="shipping-grid">
            {/* Columna 1: Envíos Nacionales */}
            <section className="shipping-column">
              <h2>{t("shipping.title")}</h2>
              <p>{t("shipping.p1")}</p>
              <p>{t("shipping.p2")}</p>
              <p>{t("shipping.p3")}</p>
              <h3>{t("shipping.subtitle1")}</h3>
              <p>{t("shipping.p4")}</p>
              <p>{t("shipping.p5")}</p>
              <h3>{t("shipping.subtitle2")}</h3>
              <p>{t("shipping.p6")}</p>
            </section>

            {/* Columna 2: Envíos Internacionales */}
            <section className="shipping-column">
              <h2>{t("shipping.intl.title")}</h2>
              <p>{t("shipping.intl.p1")}</p>
              <p>{t("shipping.intl.p2")}</p>
              <p>{t("shipping.intl.p3")}</p>
              <p>{t("shipping.intl.p4")}</p>
              <h3>{t("shipping.intl.subtitle1")}</h3>
              <p>{t("shipping.intl.p5")}</p>
              <h3>{t("shipping.intl.subtitle2")}</h3>
              <p>{t("shipping.intl.p6")}</p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
