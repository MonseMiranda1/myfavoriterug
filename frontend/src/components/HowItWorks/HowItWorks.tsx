import "./HowItWorks.css";
import { Link } from "react-router-dom";
import bordadoIcon from "../assets/icons/bordado.png";
import cajaIcon from "../assets/icons/caja.png";
import imagenIcon from "../assets/icons/imagen.png";
import subirIcon from "../assets/icons/subir.png";
import { useLanguage } from "../../i18n";

export default function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    {
      title: t("how.step1Title"),
      text: t("how.step1Text"),
      icon: subirIcon,
      className: "step-yellow",
    },
    {
      title: t("how.step2Title"),
      text: t("how.step2Text"),
      icon: imagenIcon,
      className: "step-purple",
    },
    {
      title: t("how.step3Title"),
      text: t("how.step3Text"),
      icon: bordadoIcon,
      className: "step-orange",
    },
    {
      title: t("how.step4Title"),
      text: t("how.step4Text"),
      icon: cajaIcon,
      className: "step-pink",
    },
  ];

  return (
    <section className="how-section" id="como-funciona">
      <h2>{t("how.title")}</h2>

      <div className="steps-grid">
        {steps.map((step, index) => (
          <article className={`step-card ${step.className}`} key={step.title}>
            <span className="step-number">{index + 1}</span>
            <span className="step-icon" aria-hidden="true">
              <img src={step.icon} alt="" />
            </span>
            <h3>{step.title}</h3>
            <p>{step.text}</p>
          </article>
        ))}
      </div>

      <Link to="/personaliza" className="btn btn-dark">{t("how.cta")}</Link>
    </section>
  );
}
