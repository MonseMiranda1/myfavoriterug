import { Link } from "react-router-dom";
import bordadoIcon from "../assets/icons/bordado.png";
import cajaIcon from "../assets/icons/caja.png";
import imagenIcon from "../assets/icons/imagen.png";
import subirIcon from "../assets/icons/subir.png";

const steps = [
  {
    title: "SUBE TU DISE\u00d1O",
    text: "Envianos tu imagen o idea.",
    icon: subirIcon,
    className: "step-yellow",
  },
  {
    title: "RECIBE TU VISTA PREVIA",
    text: "Te mostramos como quedara tu alfombra.",
    icon: imagenIcon,
    className: "step-purple",
  },
  {
    title: "LA HACEMOS REALIDAD",
    text: "La confeccionamos a mano con los mejores materiales.",
    icon: bordadoIcon,
    className: "step-orange",
  },
  {
    title: "LA RECIBES EN CASA",
    text: "Enviamos tu alfombra lista para usarse.",
    icon: cajaIcon,
    className: "step-pink",
  },
];

export default function HowItWorks() {
  return (
    <section className="how-section" id="como-funciona">
      <h2>&iquest;COMO FUNCIONA?</h2>

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

      <Link to="/personaliza" className="btn btn-dark">PERSONALIZAR AHORA</Link>
    </section>
  );
}
