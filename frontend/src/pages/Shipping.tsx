import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";

export default function Shipping() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="content-page">
        <article className="content-article">
          <span className="store-kicker">{t("shipping.kicker")}</span>
          <h1>{t("shipping.title")}</h1>
          <p>{t("shipping.p1")}</p>
          <p>{t("shipping.p2")}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
