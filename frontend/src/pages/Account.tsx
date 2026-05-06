import { Link } from "react-router-dom";
import { useEffect, useState, type FormEvent } from "react";
import AccountGate from "../components/AccountGate";
import AccountSidebar, { BoxIcon } from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { updateAccountUser, type AccountUser } from "../services/accountAuth";

const stats = [
  { value: "0", label: "Pedidos totales" },
  { value: "0", label: "Pedidos completados" },
  { value: "0", label: "Cotizaciones" },
  { value: "$0", label: "Total gastado" },
];

function ProfileCard({ user, onUserUpdate }: { user: AccountUser; onUserUpdate: (user: AccountUser) => void }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formUser, setFormUser] = useState(user);

  useEffect(() => {
    setFormUser(user);
  }, [user]);

  function updateField(field: keyof AccountUser, value: string) {
    setFormUser((current) => ({ ...current, [field]: value }));
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const savedUser = updateAccountUser(formUser);
    onUserUpdate(savedUser);
    setIsEditing(false);
  }

  function handleCancel() {
    setFormUser(user);
    setIsEditing(false);
  }

  return (
    <article className="account-card account-profile-card">
      <div className="account-card-header">
        <h2>Informacion Personal</h2>
        {!isEditing && (
          <button type="button" onClick={() => setIsEditing(true)}>
            Editar
          </button>
        )}
      </div>

      {isEditing ? (
        <form className="account-edit-form" onSubmit={handleSubmit}>
          <label>
            <span>Nombre completo</span>
            <input value={formUser.name} onChange={(event) => updateField("name", event.target.value)} />
          </label>
          <label>
            <span>Email</span>
            <input type="email" value={formUser.email} onChange={(event) => updateField("email", event.target.value)} />
          </label>
          <label>
            <span>Telefono</span>
            <input value={formUser.phone} onChange={(event) => updateField("phone", event.target.value)} />
          </label>
          <label>
            <span>RUT</span>
            <input value={formUser.rut} onChange={(event) => updateField("rut", event.target.value)} />
          </label>
          <label>
            <span>Direccion</span>
            <input value={formUser.address} onChange={(event) => updateField("address", event.target.value)} />
          </label>

          <div className="account-edit-actions">
            <button type="button" onClick={handleCancel}>
              Cancelar
            </button>
            <button type="submit">Guardar cambios</button>
          </div>
        </form>
      ) : (
        <div className="account-info-grid">
          <div>
            <span>Nombre completo</span>
            <strong>{user.name}</strong>
          </div>
          <div>
            <span>Email</span>
            <strong>{user.email}</strong>
          </div>
          <div>
            <span>Telefono</span>
            <strong>{user.phone}</strong>
          </div>
          <div>
            <span>RUT</span>
            <strong>{user.rut}</strong>
          </div>
          <div>
            <span>Direccion</span>
            <strong>{user.address}</strong>
          </div>
        </div>
      )}
    </article>
  );
}

function AccountContent({ sessionUser }: { sessionUser: AccountUser }) {
  const [user, setUser] = useState(sessionUser);

  useEffect(() => {
    setUser(sessionUser);
  }, [sessionUser]);

  return (
    <>
      <Navbar />

      <main className="account-page">
        <header className="account-heading">
          <span className="account-kicker">Area cliente</span>
          <h1>Mi Cuenta</h1>
          <p>
            Bienvenido, <strong>{user.name}</strong>
          </p>
        </header>

        <div className="account-shell">
          <AccountSidebar activeSection="profile" user={user} />

          <section className="account-content">
            <ProfileCard user={user} onUserUpdate={setUser} />

            <article className="account-card account-orders-card">
              <h2>Pedidos Recientes</h2>
              <div className="account-empty-orders">
                <span className="account-empty-icon">
                  <BoxIcon />
                </span>
                <strong>No tienes pedidos aun</strong>
                <Link to="/tienda">Ir a la tienda</Link>
              </div>
            </article>

            <div className="account-stats">
              {stats.map((stat) => (
                <article key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
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
