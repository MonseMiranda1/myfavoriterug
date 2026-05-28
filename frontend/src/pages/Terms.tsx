import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="content-page shipping-page">
        <article className="content-article">
          <span className="store-kicker">{t("terms.kicker")}</span>
          <h2>{t("terms.title")}</h2>
          <p>{t("terms.p1")}</p>
          <p>{t("terms.p2")}</p>
          <p>{t("terms.p3")}</p>
          <h2>{t("terms.subtitle1")}</h2>
          <p>{t("terms.p4")}</p>
          <h2>{t("terms.subtitle2")}</h2>
          <p>{t("terms.p5")}</p>
          <p>{t("terms.p6")}</p>
          <h2>{t("terms.subtitle3")}</h2>
          <p>{t("terms.p7")}</p>
          <p>{t("terms.p8")}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
