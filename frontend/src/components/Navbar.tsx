import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import buscarIcon from "../assets/icons/buscar.png";
import carritoIcon from "../assets/icons/carrito.png";
import espanolIcon from "../assets/icons/espanol.png";
import inglesIcon from "../assets/icons/ingles.png";
import userIcon from "../assets/icons/user.png";
import logo from "../assets/logo.png";
import { useLanguage, type Language } from "../i18n";
import { CART_UPDATED_EVENT, getCartQuantity } from "../services/cart";

function BrandLogo() {
  return (
    <Link to="/" className="brand-logo" aria-label="My Favorite Rug">
      <img src={logo} alt="My Favorite Rug" />
    </Link>
  );
}

export default function Navbar() {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [cartQuantity, setCartQuantity] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();

  useEffect(() => {
    const updateCartQuantity = () => setCartQuantity(getCartQuantity());

    updateCartQuantity();
    window.addEventListener(CART_UPDATED_EVENT, updateCartQuantity);
    window.addEventListener("storage", updateCartQuantity);

    return () => {
      window.removeEventListener(CART_UPDATED_EVENT, updateCartQuantity);
      window.removeEventListener("storage", updateCartQuantity);
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = searchTerm.trim();

    if (!query) {
      setIsSearchOpen((current) => !current);
      return;
    }

    navigate(`/tienda?buscar=${encodeURIComponent(query)}`);
    setIsSearchOpen(false);
  }

  function handleLanguageChange(nextLanguage: Language) {
    setLanguage(nextLanguage);
  }

  return (
    <header className="site-header">
      <nav className="main-nav">
        <BrandLogo />

        <div className="nav-links">
          <Link to="/tienda">{t("nav.store")}</Link>
          <Link to="/personaliza">{t("nav.custom")}</Link>
          <Link to="/galeria">{t("nav.gallery")}</Link>
          <Link to="/sobre-nosotros">{t("nav.about")}</Link>
          <Link to="/blog">{t("nav.blog")}</Link>
          <Link to="/contacto">{t("nav.contact")}</Link>
        </div>

        <div className={`nav-actions${isSearchOpen ? " is-search-open" : ""}`} aria-label="Acciones">
          <form className="nav-search" onSubmit={handleSearch}>
            {isSearchOpen && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder={t("nav.searchPlaceholder")}
                aria-label={t("nav.searchPlaceholder")}
                autoFocus
              />
            )}
            <button type="submit" aria-label={t("nav.searchLabel")}>
              <img src={buscarIcon} alt="" />
            </button>
          </form>
          <Link to="/cuenta" aria-label={t("nav.accountLabel")}>
            <img src={userIcon} alt="" />
          </Link>
          <Link to="/carrito" className="cart-link" aria-label={t("nav.cartLabel")}>
            <img src={carritoIcon} alt="" />
            {cartQuantity > 0 && <span>{cartQuantity}</span>}
          </Link>
          <div className="language-switcher" aria-label="Idioma">
            <button
              type="button"
              className={language === "en" ? "is-active" : ""}
              onClick={() => handleLanguageChange("en")}
              aria-label={t("nav.englishLabel")}
              aria-pressed={language === "en"}
            >
              <img src={inglesIcon} alt="" />
            </button>
            <button
              type="button"
              className={language === "es" ? "is-active" : ""}
              onClick={() => handleLanguageChange("es")}
              aria-label={t("nav.spanishLabel")}
              aria-pressed={language === "es"}
            >
              <img src={espanolIcon} alt="" />
            </button>
          </div>
        </div>
      </nav>
    </header>
  );
}
