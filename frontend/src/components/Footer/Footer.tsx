import "./Footer.css";
import { Link } from "react-router-dom";
import adminIcon from "../../assets/icons/admin.png";
import compraIcon from "../../assets/icons/compra.png";
import envioIcon from "../../assets/icons/envio.png";
import instagramIcon from "../../assets/icons/instagram.png";
import pagoIcon from "../../assets/icons/pago.png";
import tiktokIcon from "../../assets/icons/tiktok.png";
import webIcon from "../../assets/icons/web.png";
import { useLanguage } from "../../i18n";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="footer">
      <div className="footer-benefits">
        <article>
          <span>
            <img src={pagoIcon} alt="" />
          </span>
          <strong>{t("footer.cardPayment")}</strong>
          <small>{t("footer.cardPaymentSmall")}</small>
        </article>
        <article>
          <span>
            <img src={envioIcon} alt="" />
          </span>
          <strong>{t("footer.shipping")}</strong>
          <small>{t("footer.shippingSmall")}</small>
        </article>
        <article>
          <span>
            <img src={compraIcon} alt="" />
          </span>
          <strong>{t("footer.safe")}</strong>
          <small>{t("footer.safeSmall")}</small>
        </article>
      </div>

      <div className="footer-main">
        <div>
          <h3>{t("footer.info")}</h3>
          <Link to="/sobre-nosotros">{t("footer.about")}</Link>
          <Link to="/envios">{t("footer.shippingPolicy")}</Link>
          <Link to="/terminos">{t("footer.returns")}</Link>
        </div>

        <div>
          <h3>{t("footer.help")}</h3>
          <Link to="/contacto">{t("footer.contact")}</Link>
          <Link to="/cuenta/seguimiento">{t("footer.tracking")}</Link>
          <Link to="/checkout">{t("footer.paymentMethods")}</Link>
        </div>

        <div>
          <h3>{t("footer.follow")}</h3>
          <div className="social-icons">
            <a
              href="https://www.instagram.com/myfavoriterug"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
            >
              <img src={instagramIcon} alt="" />
            </a>
            <a
              href="https://www.tiktok.com/@myfavoriterug"
              target="_blank"
              rel="noreferrer"
              aria-label="TikTok"
            >
              <img src={tiktokIcon} alt="" />
            </a>
            <a
              href="https://www.etsy.com/shop/myfavoriterug/"
              target="_blank"
              rel="noreferrer"
              aria-label="Etsy"
            >
              <img src={webIcon} alt="" />
            </a>
          </div>
        </div>
      </div>

      <div className="footer-bottom">
        <p className="copyright">{t("footer.copy")}</p>
        <a href="/admin" className="admin-link" aria-label="Admin">
          <img src={adminIcon} alt="" />
        </a>
      </div>
    </footer>
  );
}
