import { Link } from "react-router-dom";
import banner from "../assets/banner.png";
import corazonIcon from "../assets/icons/corazon.png";
import envioIcon from "../assets/icons/envio.png";
import manoIcon from "../assets/icons/mano.png";
import pagarIcon from "../assets/icons/pagar.png";
import paletaIcon from "../assets/icons/paleta.png";

const benefits = [
  [paletaIcon, "100% PERSONALIZADO", "Tu lo imaginas, nosotros lo creamos."],
  [manoIcon, "HECHO A MANO", "Cada alfombra es unica, hecha con amor."],
  [envioIcon, "ENVIO SEGURO", "Enviamos a todo chile y al extranjero de forma segura."],
  [pagarIcon, "PAGA SEGURO", "Tu compra esta protegida con pagos seguros."],
];

export default function Hero() {
  return (
    <section className="hero-section" id="personaliza">
      <img src={banner} alt="Alfombra My Favorite Rug sobre piso claro" className="hero-bg" />

      <div className="hero-content">
        <div className="hero-copy">
          <h1>
            TU DISE&Ntilde;O,
            <span>TU ALFOMBRA.</span>
          </h1>
          <p>Alfombras personalizadas hechas a mano  y con mucho estilo.</p>

          <div className="hero-buttons">
            <Link to="/personaliza" className="btn btn-primary">PERSONALIZA LA TUYA <span aria-hidden="true">&rarr;</span></Link>
            <Link to="/tienda" className="btn btn-secondary">VER TIENDA</Link>
          </div>

          <div className="social-proof">
            <div className="avatars" aria-hidden="true">
              <span>A</span>
              <span>M</span>
              <span>S</span>
              <span>L</span>
              <span>R</span>
            </div>
            <div>
              <strong>★★★★★</strong>
              <small>+2,500 clientes felices</small>
            </div>
          </div>
        </div>

        <div className="handmade-badge" aria-label="Hecho a mano con amor">
          <span>HECHO A MANO</span>
          <strong><img src={corazonIcon} alt="" /></strong>
          <span>CON ESTILO</span>
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
