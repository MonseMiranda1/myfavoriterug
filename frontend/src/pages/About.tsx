import { Link } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import corazonIcon from "../assets/icons/corazon.png";
import manoIcon from "../assets/icons/mano.png";
import paletaIcon from "../assets/icons/paleta.png";
import claire from "../assets/claire.jpeg";
import kidney from "../assets/kidney.jpeg";
import monse from "../assets/monse.jpg";
import { useLanguage } from "../i18n";

export default function About() {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-copy">
            <span className="about-kicker">{t("about.kicker")}</span>
            <h1>{t("about.title")}</h1>
            <p>{t("about.subtitle")}</p>
          </div>

          <div className="about-logo-card">
            <img src={monse} alt="Monse, creator of My Favorite Rug" />
          </div>
        </section>

        <section className="about-story" id="our-story">
          <article className="about-text-panel">
            <p>{t("about.story1")}</p>
            <p>{t("about.story2")}</p>
            <p>{t("about.story3")}</p>
          </article>

          <aside className="about-feature-card">
            <div>
              <img src={paletaIcon} alt="" />
              <span>{t("about.idea")}</span>
            </div>
            <div>
              <img src={manoIcon} alt="" />
              <span>{t("about.handmade")}</span>
            </div>
            <div>
              <img src={corazonIcon} alt="" />
              <span>{t("about.details")}</span>
            </div>
          </aside>
        </section>

        <section
          className="about-inspiration"
          aria-label={t("about.inspirationLabel")}
        >
          <div className="about-inspiration-photos">
            <figure className="about-pet-photo about-pet-photo-kidney">
              <img src={kidney} alt={t("about.kidneyAlt")} />
              <figcaption>Kidney</figcaption>
            </figure>
            <figure className="about-pet-photo about-pet-photo-claire">
              <img src={claire} alt={t("about.claireAlt")} />
              <figcaption>Claire</figcaption>
            </figure>
          </div>

          <article className="about-inspiration-copy">
            <span>{t("about.inspirationKicker")}</span>
            <p>{t("about.inspiration1")}</p>
            <p>{t("about.inspiration2")}</p>
            <p>{t("about.inspiration3")}</p>
          </article>
        </section>

        <section className="about-info-sections" aria-label="About tufting">
          <article id="que-es-tufting">
            <h2>{t("about.tuftingTitle")}</h2>
            <p>{t("about.tuftingText")}</p>
          </article>
          <article id="proceso-artesanal">
            <h2>{t("about.processTitle")}</h2>
            <p>{t("about.processText")}</p>
          </article>
          <article id="materiales-calidad">
            <h2>{t("about.materialsTitle")}</h2>
            <p>{t("about.materialsText")}</p>
          </article>
        </section>

        <section className="about-info-sections" aria-label="About tufting">
          <article id="Diseño Unico">
            <h2>{t("about.value1Title")}</h2>
            <p>{t("about.value1Text")}</p>
          </article>
          <article id="Hecho-con-cuidado">
            <h2>{t("about.value2Title")}</h2>
            <p>{t("about.value2Text")}</p>
          </article>
          <article id="Espacios con personalidad">
            <h2>{t("about.value3Title")}</h2>
            <p>{t("about.value3Text")}</p>
          </article>
        </section>

        <section className="about-cta">
          <div>
            <h2>{t("about.ctaTitle")}</h2>
            <p>{t("about.ctaText")}</p>
          </div>
          <Link to="/personaliza" className="btn btn-primary">
            {t("how.cta")} <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
