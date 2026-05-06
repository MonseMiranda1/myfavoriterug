import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import buscarIcon from "../assets/icons/buscar.png";
import carritoIcon from "../assets/icons/carrito.png";
import userIcon from "../assets/icons/user.png";
import logo from "../assets/logo.png";
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

  return (
    <header className="site-header">
      <nav className="main-nav">
        <BrandLogo />

        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/personaliza">Personaliza</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/#como-funciona">Como funciona</Link>
          <Link to="/sobre-nosotros">Sobre nosotros</Link>
        </div>

        <div className={`nav-actions${isSearchOpen ? " is-search-open" : ""}`} aria-label="Acciones">
          <form className="nav-search" onSubmit={handleSearch}>
            {isSearchOpen && (
              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Buscar alfombra"
                aria-label="Buscar alfombra"
                autoFocus
              />
            )}
            <button type="submit" aria-label="Buscar">
              <img src={buscarIcon} alt="" />
            </button>
          </form>
          <Link to="/cuenta" aria-label="Cuenta">
            <img src={userIcon} alt="" />
          </Link>
          <Link to="/carrito" className="cart-link" aria-label="Carrito">
            <img src={carritoIcon} alt="" />
            {cartQuantity > 0 && <span>{cartQuantity}</span>}
          </Link>
        </div>
      </nav>
    </header>
  );
}
