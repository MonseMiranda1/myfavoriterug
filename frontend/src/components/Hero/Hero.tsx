import "./Hero.css";
import { Link } from "react-router-dom";
import banner from "../../assets/banner.png";
import corazonIcon from "../../assets/icons/corazon.png";
import envioIcon from "../../assets/icons/envio.png";
import manoIcon from "../../assets/icons/mano.png";
import pagarIcon from "../../assets/icons/pagar.png";
import paletaIcon from "../../assets/icons/paleta.png";
import { useLanguage } from "../../i18n";

export default function Hero() {
  const { t } = useLanguage();
  const benefits = [
    [paletaIcon, t("hero.benefitCustomTitle"), t("hero.benefitCustomText")],
    [manoIcon, t("hero.benefitHandmadeTitle"), t("hero.benefitHandmadeText")],
    [envioIcon, t("hero.benefitShippingTitle"), t("hero.benefitShippingText")],
    [pagarIcon, t("hero.benefitPaymentTitle"), t("hero.benefitPaymentText")],
  ];

  return (
    <section className="hero-section" id="personaliza">
      <img src={banner} alt="My Favorite Rug custom rug" className="hero-bg" />

      <div className="hero-content">
        <div className="hero-copy">
          <h1>
            {t("hero.titleTop")}
            <span>{t("hero.titleBottom")}</span>
          </h1>
          <p>{t("hero.subtitle")}</p>

          <div className="hero-buttons">
            <Link to="/personaliza" className="btn btn-primary">
              {t("hero.customize")} <span aria-hidden="true">&rarr;</span>
            </Link>
            <Link to="/tienda" className="btn btn-secondary">{t("hero.shop")}</Link>
          </div>

        </div>

        <div className="handmade-badge" aria-label="Handmade with love">
          <span>{t("hero.badgeTop")}</span>
          <strong><img src={corazonIcon} alt="" /></strong>
          <span>{t("hero.badgeBottom")}</span>
        </div>
      </div>

      <div className="benefit-strip">
        {benefits.map(([icon, title, text]) => (
          <article key={title}>
            <span className="benefit-icon"><img src={icon} alt="" /></span>
            <div>
              <h3>{title}</h3>
              <p>{text}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

