import { Link } from "react-router-dom";
import AccountGate from "../components/AccountGate";
import AccountSidebar, { BoxIcon } from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.3-4.3" />
      <path d="M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z" />
    </svg>
  );
}

export default function Orders() {
  return (
    <AccountGate>
      {(user) => (
        <>
          <Navbar />

          <main className="account-list-page">
            <div className="account-shell">
              <AccountSidebar activeSection="orders" user={user} />

              <section className="account-content">
                <header className="account-list-heading">
                  <span>Area cliente</span>
                  <h1>Mis Pedidos</h1>
                  <p>Historial completo de tus pedidos.</p>
                </header>

                <label className="account-list-search">
                  <input type="search" placeholder="Buscar por numero de pedido, estado o metodo de pago..." />
                  <SearchIcon />
                </label>

                <section className="account-list-empty">
                  <span>
                    <BoxIcon />
                  </span>
                  <h2>No tienes pedidos aun</h2>
                  <p>Comienza a comprar en nuestra tienda.</p>
                  <Link to="/tienda">Ir a la tienda</Link>
                </section>
              </section>
            </div>
          </main>

          <Footer />
        </>
      )}
    </AccountGate>
  );
}
