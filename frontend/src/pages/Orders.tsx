import { Link } from "react-router-dom";
import AccountGate from "../components/AccountGate/AccountGate";
import AccountSidebar, { BoxIcon } from "../components/AccountSidebar/AccountSidebar";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m21 21-4.3-4.3" />
      <path d="M10.8 18a7.2 7.2 0 1 0 0-14.4 7.2 7.2 0 0 0 0 14.4Z" />
    </svg>
  );
}

export default function Orders() {
  const { t } = useLanguage();

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
                  <span>{t("account.area")}</span>
                  <h1>{t("account.orders")}</h1>
                  <p>{t("account.ordersHistory")}</p>
                </header>

                <label className="account-list-search">
                  <input type="search" placeholder={t("account.ordersSearch")} />
                  <SearchIcon />
                </label>

                <section className="account-list-empty">
                  <span>
                    <BoxIcon />
                  </span>
                  <h2>{t("account.noOrders")}</h2>
                  <p>{t("account.startShopping")}</p>
                  <Link to="/tienda">{t("cart.goStore")}</Link>
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
