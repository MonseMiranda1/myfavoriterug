import logo from "../assets/logo.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-benefits">
        <article><span>MSI</span><strong>PAGA EN 3 MSI</strong><small>Con tarjetas participantes</small></article>
        <article><span>MX</span><strong>ENVIOS A TODO MEXICO</strong><small>Rapidos y seguros</small></article>
        <article><span>OK</span><strong>COMPRA 100% SEGURA</strong><small>Tus datos estan protegidos</small></article>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <img src={logo} alt="My Favorite Rug" className="footer-logo" />
          <p>Alfombras personalizadas hechas a mano con amor.</p>
        </div>

        <div>
          <h3>INFORMACION</h3>
          <a href="/">Sobre nosotros</a>
          <a href="/">Preguntas frecuentes</a>
          <a href="/">Politicas de envio</a>
          <a href="/">Cambios y devoluciones</a>
        </div>

        <div>
          <h3>AYUDA</h3>
          <a href="/">Contacto</a>
          <a href="/">Seguimiento de pedido</a>
          <a href="/">Metodos de pago</a>
        </div>

        <div>
          <h3>SIGUENOS</h3>
          <div className="social-icons">
            <span>IG</span>
            <span>TK</span>
            <span>YT</span>
          </div>
        </div>

        <div>
          <h3>NEWSLETTER</h3>
          <p>Recibe novedades y promociones.</p>
          <form className="newsletter">
            <input type="email" placeholder="Tu correo electronico" aria-label="Tu correo electronico" />
            <button type="submit" aria-label="Enviar">-&gt;</button>
          </form>
        </div>
      </div>

      <p className="copyright">(c) 2026 My Favorite Rug. Todos los derechos reservados.</p>
    </footer>
  );
}
