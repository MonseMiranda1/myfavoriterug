import { Link } from "react-router-dom";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import corazonIcon from "../assets/icons/corazon.png";
import manoIcon from "../assets/icons/mano.png";
import paletaIcon from "../assets/icons/paleta.png";
import logo from "../assets/logo.png";

export default function About() {
  return (
    <>
      <Navbar />

      <main className="about-page">
        <section className="about-hero">
          <div className="about-copy">
            <span className="about-kicker">Sobre nosotros</span>
            <h1>La historia detras de My Favorite Rug</h1>
            <p>
              Soy la creadora detras de My Favorite Rug, un emprendimiento dedicado
              al diseno y fabricacion de alfombras personalizadas hechas a mano.
            </p>
          </div>

          <div className="about-logo-card" aria-hidden="true">
            <img src={logo} alt="" />
            <strong>Hecho a mano</strong>
          </div>
        </section>

        <section className="about-story">
          <article className="about-text-panel">
            <p>
              Me dedico a crear alfombras personalizadas hechas a mano, disenadas
              desde cero segun lo que tu imagines. Cada diseno es unico y esta
              pensado para darle vida, estilo y personalidad a tus espacios.
            </p>
            <p>
              Me encanta transformar ideas en algo real: desde personajes, logos o
              disenos creativos, hasta piezas totalmente originales.
            </p>
            <p>
              Este proyecto nace desde la creatividad, el emprendimiento y las ganas
              de hacer algo distinto, cuidando cada detalle en el proceso.
            </p>
          </article>

          <aside className="about-feature-card">
            <div>
              <img src={paletaIcon} alt="" />
              <span>Tu idea</span>
            </div>
            <div>
              <img src={manoIcon} alt="" />
              <span>Trabajo manual</span>
            </div>
            <div>
              <img src={corazonIcon} alt="" />
              <span>Detalles con amor</span>
            </div>
          </aside>
        </section>

        <section className="about-values">
          <article>
            <strong>Diseño unico</strong>
            <span>Cada alfombra parte desde una idea distinta.</span>
          </article>
          <article>
            <strong>Hecho con cuidado</strong>
            <span>Cada pieza se trabaja a mano, paso a paso.</span>
          </article>
          <article>
            <strong>Espacios con personalidad</strong>
            <span>La meta es crear algo que se sienta realmente tuyo.</span>
          </article>
        </section>

        <section className="about-cta">
          <div>
            <h2>Transformemos tu idea en una alfombra</h2>
            <p>Sube una imagen, elige medidas y cuentanos que quieres crear.</p>
          </div>
          <Link to="/personaliza" className="btn btn-primary">
            PERSONALIZAR AHORA <span aria-hidden="true">&rarr;</span>
          </Link>
        </section>
      </main>

      <Footer />
    </>
  );
}
