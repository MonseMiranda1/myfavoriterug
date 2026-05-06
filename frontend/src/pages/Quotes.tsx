import { Link } from "react-router-dom";
import { useMemo } from "react";
import AccountGate from "../components/AccountGate";
import AccountSidebar, { QuoteIcon } from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { getQuoteRequests, type CustomQuoteRequest } from "../services/quotes";

function formatPrice(amountClp: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(amountClp);
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("es-CL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(new Date(date));
}

function QuoteCard({ quote }: { quote: CustomQuoteRequest }) {
  return (
    <article className="account-quote-card">
      <div>
        <span>{quote.id}</span>
        <strong>{quote.size}</strong>
        <small>{formatDate(quote.date)} · {quote.imageName}</small>
      </div>
      <dl>
        <div>
          <dt>Lana</dt>
          <dd>{quote.wool}</dd>
        </div>
        <div>
          <dt>Colores</dt>
          <dd>{quote.colors}</dd>
        </div>
        <div>
          <dt>Total referencial</dt>
          <dd>{formatPrice(quote.totalClp)}</dd>
        </div>
      </dl>
      {quote.comments && <p>{quote.comments}</p>}
    </article>
  );
}

export default function Quotes() {
  const quotes = useMemo(() => getQuoteRequests(), []);

  return (
    <AccountGate>
      {(user) => (
        <>
          <Navbar />

          <main className="account-list-page">
            <div className="account-shell">
              <AccountSidebar activeSection="quotes" user={user} />

              <section className="account-content">
                <header className="account-list-heading">
                  <span>Area cliente</span>
                  <h1>Mis Cotizaciones</h1>
                  <p>Historial de cotizaciones solicitadas.</p>
                </header>

                {quotes.length > 0 ? (
                  <section className="account-quotes-list">
                    {quotes.map((quote) => (
                      <QuoteCard quote={quote} key={quote.id} />
                    ))}
                  </section>
                ) : (
                  <section className="account-list-empty">
                    <span>
                      <QuoteIcon />
                    </span>
                    <h2>No tienes cotizaciones</h2>
                    <p>Aun no has solicitado ninguna cotizacion.</p>
                    <Link to="/personaliza">Solicitar cotizacion</Link>
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
