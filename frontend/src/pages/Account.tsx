import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import AccountGate from "../components/AccountGate";
import AccountSidebar, { BoxIcon } from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";
import { updateAccountUser, type AccountUser } from "../services/accountAuth";

const stats = [
  { value: "0", labelKey: "account.totalOrders" },
  { value: "0", labelKey: "account.completedOrders" },
  { value: "0", labelKey: "account.totalQuotes" },
  { value: "$0", labelKey: "account.totalSpent" },
];

function ProfileCard({ user, onUserUpdate }: { user: AccountUser; onUserUpdate: (user: AccountUser) => void }) {
  const { t } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [formUser, setFormUser] = useState(user);
  const [message, setMessage] = useState("");
  const hasRut = Boolean(user.rut?.trim());

  useEffect(() => {
    if (!isEditing) {
      setFormUser(user);
    }
  }, [isEditing, user]);

  function updateField(field: keyof AccountUser, value: string) {
    setFormUser((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!hasRut && !formUser.rut.trim()) {
      setMessage("Ingresa tu RUT para completar el perfil.");
      return;
    }

    try {
      const savedUser = await updateAccountUser(formUser);
      onUserUpdate(savedUser);
      setMessage("");
      setIsEditing(false);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "No se pudo guardar.");
    }
  }

  function handleCancel() {
    setFormUser(user);
    setMessage("");
    setIsEditing(false);
  }

  return (
    <article className="account-card account-profile-card">
      <div className="account-card-header">
        <h2>{t("account.personalInfo")}</h2>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)}>
            {t("account.edit")}
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="account-edit-form" onSubmit={handleSubmit}>
          <label>
            <span>{t("account.fullName")}</span>
            <input value={formUser.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={user.email} readOnly aria-readonly="true" className="account-locked-input" />
          </label>
          <label>
            <span>{t("account.phone")}</span>
            <input value={formUser.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            <span>RUT</span>
            <input
              value={hasRut ? user.rut : formUser.rut}
              onChange={(event) => updateField("rut", event.target.value)}
              readOnly={hasRut}
              aria-readonly={hasRut}
              className={hasRut ? "account-locked-input" : undefined}
              required={!hasRut}
            />
          </label>
          <label>
            <span>{t("account.address")}</span>
            <input value={formUser.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>

          <div className="account-edit-actions">
            {message && <strong className="account-login-error">{message}</strong>}
            <button type="button" onClick={handleCancel}>
              {t("account.cancel")}
            </button>
            <button type="submit">{t("account.save")}</button>
          </div>
        </form>
      ) : (
        <div className="account-info-grid">
          <div>
            <span>{t("account.fullName")}</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>{t("account.phone")}</span>
            <strong>{user.phone}</strong>
          </div>
          <div>
            <span>RUT</span>
            <strong>{hasRut ? user.rut : "Pendiente por completar"}</strong>
          </div>
          <div>
            <span>{t("account.address")}</span>
            <strong>{user.address}</strong>
          </div>
        </div>
      )}
    </article>
  );
}

function AccountContent({ sessionUser }: { sessionUser: AccountUser }) {
  const { t } = useLanguage();

  return (
    <>
      <Navbar />

      <main className="account-page">
        <header className="account-heading">
          <span className="account-kicker">{t("account.area")}</span>
          <h1>{t("account.myAccount")}</h1>
          <p>
            {t("account.welcome")} <strong>{sessionUser.name}</strong>
          </p>
        </header>

        <div className="account-shell">
          <AccountSidebar activeSection="profile" user={sessionUser} />

          <section className="account-content">
            <ProfileCard key={`${sessionUser.email}-${sessionUser.name}`} user={sessionUser} onUserUpdate={() => undefined} />

            <article className="account-card account-orders-card">
              <h2>{t("account.recentOrders")}</h2>
              <div className="account-empty-orders">
                <span className="account-empty-icon">
                  <BoxIcon />
                </span>
                <strong>{t("account.noOrders")}</strong>
                <Link to="/tienda">{t("cart.goStore")}</Link>
              </div>
            </article>

            <div className="account-stats">
              {stats.map((stat) => (
                <article key={stat.labelKey}>
                  <strong>{stat.value}</strong>
                  <span>{t(stat.labelKey as never)}</span>
                </article>
              ))}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}

export default function Account() {
  return (
    <AccountGate>
      {(sessionUser) => <AccountContent sessionUser={sessionUser} />}
    </AccountGate>
  );
}
