import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";

export default function Terms() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />
      <main className="content-page">
        <article className="content-article">
          <span className="store-kicker">{t("terms.kicker")}</span>
          <h1>{t("terms.title")}</h1>
          <p>{t("terms.p1")}</p>
          <p>{t("terms.p2")}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
