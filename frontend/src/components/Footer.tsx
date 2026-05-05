import { Link } from "react-router-dom";
import logo from "../assets/logo.png";
import adminIcon from "../assets/icons/admin.png";
import compraIcon from "../assets/icons/compra.png";
import envioIcon from "../assets/icons/envio.png";
import instagramIcon from "../assets/icons/instagram.png";
import pagoIcon from "../assets/icons/pago.png";
import tiktokIcon from "../assets/icons/tiktok.png";
import webIcon from "../assets/icons/web.png";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-benefits">
        <article><span><img src={pagoIcon} alt="" /></span><strong>PAGA CON TARJETA</strong><small>o transferencias</small></article>
        <article><span><img src={envioIcon} alt="" /></span><strong>ENVIOS A TODO CHILE E INTERNACIONAL</strong><small>Rapidos y seguros</small></article>
        <article><span><img src={compraIcon} alt="" /></span><strong>COMPRA 100% SEGURA</strong><small>Tus datos están protegidos</small></article>
      </div>

      <div className="footer-main">
        <div className="footer-brand">
          <img src={logo} alt="My Favorite Rug" className="footer-logo" />
          <a href="/admin" className="admin-link" aria-label="Entrar como superadmin">
            <img src={adminIcon} alt="" />
          </a>
          <p>Alfombras personalizadas hechas a mano, con estilo.</p>
        </div>

        <div>
          <h3>INFORMACION</h3>
          <Link to="/sobre-nosotros">Sobre nosotros</Link>
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
            <a href="https://www.instagram.com/myfavoriterug" target="_blank" rel="noreferrer" aria-label="Instagram">
              <img src={instagramIcon} alt="" />
            </a>
            <a href="https://www.tiktok.com/@myfavoriterug" target="_blank" rel="noreferrer" aria-label="TikTok">
              <img src={tiktokIcon} alt="" />
            </a>
            <a href="https://www.etsy.com/shop/myfavoriterug/" target="_blank" rel="noreferrer" aria-label="Etsy">
              <img src={webIcon} alt="" />
            </a>
          </div>
        </div>

        <div>
          <h3>NEWSLETTER</h3>
          <p>Recibe novedades y promociones.</p>
          <form className="newsletter">
            <input type="email" placeholder="Tu correo electronico" aria-label="Tu correo electronico" />
            <button type="submit" aria-label="Enviar"><span aria-hidden="true">&rarr;</span></button>
          </form>
        </div>
      </div>

      <p className="copyright">(c) 2026 My Favorite Rug. Todos los derechos reservados.</p>
    </footer>
  );
}
