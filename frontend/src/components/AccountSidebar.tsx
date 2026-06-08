import { Link } from "react-router-dom";
import { useLanguage } from "../i18n";
import { useAccountAuthStore, type AccountUser } from "../services/accountAuth";

type AccountSection = "profile" | "orders" | "quotes" | "wishlist" | "tracking";

function AccountIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
      <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
    </svg>
  );
}

function BoxIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m12 3 8 4.5v9L12 21l-8-4.5v-9L12 3Z" />
      <path d="m4 7.5 8 4.5 8-4.5" />
      <path d="M12 12v9" />
    </svg>
  );
}

function QuoteIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3h7l4 4v14H7V3Z" />
      <path d="M14 3v5h4" />
      <path d="M10 12h5" />
      <path d="M10 16h5" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export { BoxIcon, QuoteIcon };

export default function AccountSidebar({ activeSection, user }: { activeSection: AccountSection; user: AccountUser }) {
  const { t, language } = useLanguage();
  const logoutAccount = useAccountAuthStore((state) => state.logout);

  return (
    <aside className="account-sidebar">
      <div className="account-user">
        <span aria-hidden="true">U</span>
        <div>
          <strong>{user.name}</strong>
          <small>{user.email}</small>
        </div>
      </div>

      <nav className="account-nav" aria-label="Menu de cuenta">
        <Link to="/cuenta" className={activeSection === "profile" ? "is-active" : ""}>
          <span className="account-icon">
            <AccountIcon />
          </span>
          {language === "en" ? "My Profile" : "Mi Perfil"}
        </Link>
        <Link to="/cuenta/pedidos" className={activeSection === "orders" ? "is-active" : ""}>
          <span className="account-icon">
            <BoxIcon />
          </span>
          {t("account.orders")}
          <strong className="account-chevron">
            <ChevronIcon />
          </strong>
        </Link>
        <Link to="/cuenta/cotizaciones" className={activeSection === "quotes" ? "is-active" : ""}>
          <span className="account-icon">
            <QuoteIcon />
          </span>
          {t("account.quotes")}
          <strong className="account-chevron">
            <ChevronIcon />
          </strong>
        </Link>
        <Link to="/cuenta/wishlist" className={activeSection === "wishlist" ? "is-active" : ""}>
          <span className="account-icon">
            <QuoteIcon />
          </span>
          Wishlist
          <strong className="account-chevron">
            <ChevronIcon />
          </strong>
        </Link>
        <Link to="/cuenta/seguimiento" className={activeSection === "tracking" ? "is-active" : ""}>
          <span className="account-icon">
            <BoxIcon />
          </span>
          {t("account.tracking")}
          <strong className="account-chevron">
            <ChevronIcon />
          </strong>
        </Link>
        <button type="button" className="logout" onClick={logoutAccount}>
          <span className="account-icon">
            <LogoutIcon />
          </span>
          {language === "en" ? "Log out" : "Cerrar sesion"}
        </button>
      </nav>
    </aside>
  );
}
