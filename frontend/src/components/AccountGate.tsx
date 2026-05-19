import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n";
import { ACCOUNT_AUTH_EVENT, getAccountUser, loginAccount, refreshAccountUser, registerAccount, type AccountUser } from "../services/accountAuth";
import Footer from "./Footer";
import Navbar from "./Navbar";

type AccountGateProps = {
  children: (user: AccountUser) => ReactNode;
};

export default function AccountGate({ children }: AccountGateProps) {
  const { language } = useLanguage();
  const [user, setUser] = useState<AccountUser | null>(() => getAccountUser());
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [email, setEmail] = useState("miussette.alfaro@gmail.com");
  const [resetEmail, setResetEmail] = useState("miussette.alfaro@gmail.com");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const syncUser = () => setUser(getAccountUser());

    window.addEventListener(ACCOUNT_AUTH_EVENT, syncUser);
    window.addEventListener("storage", syncUser);
    refreshAccountUser().then(setUser);

    return () => {
      window.removeEventListener(ACCOUNT_AUTH_EVENT, syncUser);
      window.removeEventListener("storage", syncUser);
    };
  }, []);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError(language === "en" ? "Enter your email and password to continue." : "Ingresa tu correo y contraseña para continuar.");
      return;
    }

    setError("");

    try {
      const nextUser = isCreatingAccount
        ? await registerAccount(email.trim(), password)
        : await loginAccount(email.trim(), password);
      setUser(nextUser);
      setPassword("");
    } catch (error) {
      setError(error instanceof Error ? error.message : language === "en" ? "Could not sign in." : "No se pudo iniciar sesion.");
    }
  }

  function toggleAccountMode() {
    setError("");
    setIsCreatingAccount((current) => !current);
  }

  function openResetModal() {
    setResetEmail(email);
    setResetSent(false);
    setIsResetModalOpen(true);
  }

  function closeResetModal() {
    setIsResetModalOpen(false);
  }

  function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResetSent(true);
  }

  if (user) {
    return <>{children(user)}</>;
  }

  return (
    <>
      <Navbar />

      <main className="account-login-page">
        <section className="account-login-card">
          <span className="account-kicker">{language === "en" ? "Customer area" : "Área cliente"}</span>
          <h1>{isCreatingAccount ? (language === "en" ? "Create account" : "Crea tu cuenta") : (language === "en" ? "Sign in" : "Inicia sesion")}</h1>
          <p>
            {isCreatingAccount
              ? (language === "en" ? "Create an account to save your details and review future orders." : "Crea una cuenta para guardar tus datos y revisar tus pedidos.")
              : (language === "en" ? "Access your profile, orders, and quotes." : "Accede para revisar tu perfil, pedidos y cotizaciones.")}
          </p>

          <form onSubmit={handleLogin}>
            <label>
              <span>{language === "en" ? "Email" : "Correo electrónico"}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
            </label>
            <label>
              <span>{language === "en" ? "Password" : "Contraseña"}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
              />
            </label>
            {!isCreatingAccount && (
              <button className="account-forgot-link" type="button" onClick={openResetModal}>
                {language === "en" ? "Forgot your password?" : "Recuperar contraseña"}
              </button>
            )}

            {error && <strong className="account-login-error">{error}</strong>}

            <button type="submit">{isCreatingAccount ? (language === "en" ? "Create account" : "Crear cuenta") : (language === "en" ? "Enter my account" : "Entrar a mi cuenta")}</button>
          </form>

          <div className="account-login-options">
            <button type="button" onClick={toggleAccountMode}>
              {isCreatingAccount
                ? (language === "en" ? "I already have an account" : "Ya tengo cuenta")
                : (language === "en" ? "Create account" : "Crear cuenta")}
            </button>
            <Link to="/checkout">{language === "en" ? "Checkout as guest" : "Comprar como invitado"}</Link>
          </div>
        </section>
      </main>

      {isResetModalOpen && (
        <div className="account-modal-backdrop" role="presentation" onClick={closeResetModal}>
          <section
            className="account-reset-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="account-reset-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button className="account-modal-close" type="button" aria-label={language === "en" ? "Close" : "Cerrar"} onClick={closeResetModal}>
              ×
            </button>
            <span className="account-kicker">{language === "en" ? "Password reset" : "Restaurar acceso"}</span>
            <h2 id="account-reset-title">{language === "en" ? "Reset your password" : "Recuperar contraseña"}</h2>
            <p>
              {language === "en"
                ? "Enter your email and we will send instructions to reset your password."
                : "Ingresa tu correo y te enviaremos instrucciones para restaurar tu contraseña."}
            </p>

            <form onSubmit={handlePasswordReset}>
              <label>
                <span>{language === "en" ? "Email" : "Correo electrónico"}</span>
                <input
                  type="email"
                  value={resetEmail}
                  onChange={(event) => setResetEmail(event.target.value)}
                  autoComplete="email"
                  required
                />
              </label>
              {resetSent && (
                <strong className="account-reset-message">
                  {language === "en" ? "Recovery instructions were sent to your email." : "Enviamos las instrucciones a tu correo."}
                </strong>
              )}
              <button type="submit">{language === "en" ? "Send instructions" : "Enviar instrucciones"}</button>
            </form>
          </section>
        </div>
      )}

      <Footer />
    </>
  );
}
