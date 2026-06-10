import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import AccountGate from "../components/AccountGate/AccountGate";
import AccountSidebar, { BoxIcon } from "../components/AccountSidebar/AccountSidebar";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { useLanguage } from "../i18n";
import { getApiErrorMessage } from "../services/http";
import { getAccountOrders, type Order } from "../services/orders";

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

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
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState("");

  useEffect(() => {
    getAccountOrders()
      .then(setOrders)
      .catch((error) => setLoadError(getApiErrorMessage(error, "No pudimos cargar tus pedidos. Intenta nuevamente.")))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredOrders = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return orders;

    return orders.filter((order) =>
      [order.orderNumber, order.id, order.status, order.shippingStatus]
        .some((value) => String(value ?? "").toLowerCase().includes(query)),
    );
  }, [orders, search]);

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
                  <input
                    type="search"
                    placeholder={t("account.ordersSearch")}
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                  <SearchIcon />
                </label>

                {isLoading ? (
                  <section className="account-list-empty">
                    <p>Cargando tus pedidos...</p>
                  </section>
                ) : loadError ? (
                  <section className="account-list-empty">
                    <p>{loadError}</p>
                  </section>
                ) : filteredOrders.length > 0 ? (
                  <div className="tracking-list">
                    {filteredOrders.map((order) => (
                      <article key={order.id}>
                        <strong>{order.orderNumber ?? `Pedido #${order.id}`}</strong>
                        <span>{order.shippingStatus || order.status}</span>
                        <p>{new Date(order.createdAt).toLocaleString("es-CL")}</p>
                        <p>{order.items.length} producto(s) · {formatPrice(order.total)}</p>
                      </article>
                    ))}
                  </div>
                ) : (
                <section className="account-list-empty">
                  <span>
                    <BoxIcon />
                  </span>
                  <h2>{t("account.noOrders")}</h2>
                  <p>{t("account.startShopping")}</p>
                  <Link to="/tienda">{t("cart.goStore")}</Link>
                </section>
                )}
              </section>
            </div>
          </main>

          <Footer />
        </>
      )}
    </AccountGate>
  );
}
