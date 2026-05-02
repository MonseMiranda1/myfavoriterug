import { Link } from "react-router-dom";
import buscarIcon from "../assets/icons/buscar.png";
import carritoIcon from "../assets/icons/carrito.png";
import userIcon from "../assets/icons/user.png";
import logo from "../assets/logo.png";

function BrandLogo() {
  return (
    <Link to="/" className="brand-logo" aria-label="My Favorite Rug">
      <img src={logo} alt="My Favorite Rug" />
    </Link>
  );
}

export default function Navbar() {
  return (
    <header className="site-header">
      <div className="shipping-bar">ENVIO GRATIS EN PEDIDOS +$ <span>TRUCK</span></div>

      <nav className="main-nav">
        <BrandLogo />

        <div className="nav-links">
          <Link to="/">Inicio</Link>
          <Link to="/#personaliza">Personaliza</Link>
          <Link to="/tienda">Tienda</Link>
          <Link to="/#como-funciona">Como funciona</Link>
          <Link to="/">Sobre nosotros</Link>
        </div>

        <div className="nav-actions" aria-label="Acciones">
          <button type="button" aria-label="Buscar">
            <img src={buscarIcon} alt="" />
          </button>
          <button type="button" aria-label="Cuenta">
            <img src={userIcon} alt="" />
          </button>
          <Link to="/carrito" className="cart-link" aria-label="Carrito">
            <img src={carritoIcon} alt="" />
            <span>2</span>
          </Link>
        </div>
      </nav>
    </header>
  );
}
