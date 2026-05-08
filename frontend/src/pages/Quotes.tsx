import { Link } from "react-router-dom";
import { useMemo } from "react";
import AccountGate from "../components/AccountGate";
import AccountSidebar, { QuoteIcon } from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
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
  const { t } = useLanguage();

  return (
    <article className="account-quote-card">
      <div>
        <span>{quote.id}</span>
        <strong>{quote.size}</strong>
        <small>{formatDate(quote.date)} · {quote.imageName}</small>
      </div>
      <dl>
        <div>
          <dt>{t("account.yarn")}</dt>
          <dd>{quote.wool}</dd>
        </div>
        <div>
          <dt>{t("account.colors")}</dt>
          <dd>{quote.colors}</dd>
        </div>
        <div>
          <dt>{t("account.referenceTotal")}</dt>
          <dd>{formatPrice(quote.totalClp)}</dd>
        </div>
      </dl>
      {quote.comments && <p>{quote.comments}</p>}
    </article>
  );
}

export default function Quotes() {
  const { t } = useLanguage();
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
                  <span>{t("account.area")}</span>
                  <h1>{t("account.quotes")}</h1>
                  <p>{t("account.quotesHistory")}</p>
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
                    <h2>{t("account.noQuotes")}</h2>
                    <p>{t("account.noQuotesText")}</p>
                    <Link to="/personaliza">{t("account.requestQuote")}</Link>
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
