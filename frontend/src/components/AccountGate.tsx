import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import Footer from "./Footer";
import Navbar from "./Navbar";
import { ACCOUNT_AUTH_EVENT, getAccountUser, loginAccount, type AccountUser } from "../services/accountAuth";

type AccountGateProps = {
  children: (user: AccountUser) => ReactNode;
};

export default function AccountGate({ children }: AccountGateProps) {
  const [user, setUser] = useState<AccountUser | null>(() => getAccountUser());
  const [email, setEmail] = useState("miussette.alfaro@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const syncUser = () => setUser(getAccountUser());

    window.addEventListener(ACCOUNT_AUTH_EVENT, syncUser);
    window.addEventListener("storage", syncUser);

    return () => {
      window.removeEventListener(ACCOUNT_AUTH_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError("Ingresa tu correo y contrasena para continuar.");
      return;
    }

    setError("");
    setUser(loginAccount(email.trim()));
  }

  if (user) {
    return <>{children(user)}</>;
  }

  return (
    <>
      <Navbar />

      <main className="account-login-page">
        <section className="account-login-card">
          <span className="account-kicker">Area cliente</span>
          <h1>Inicia sesión</h1>
          <p>Accede para revisar tu perfil, pedidos y cotizaciones.</p>

          <form onSubmit={handleLogin}>
            <label>
              <span>Correo electronico</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              <span>Contrasena</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>

            {error && <strong className="account-login-error">{error}</strong>}

            <button type="submit">Entrar a mi cuenta</button>
          </form>
        </section>
      </main>

      <Footer />
    </>
  );
}
