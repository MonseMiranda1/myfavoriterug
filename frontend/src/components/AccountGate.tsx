import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n";
import {
  ACCOUNT_AUTH_EVENT,
  confirmPasswordReset,
  getAccountUser,
  loginAccount,
  refreshAccountUser,
  registerAccount,
  requestPasswordReset,
  type AccountUser,
} from "../services/accountAuth";
import Footer from "./Footer";
import Navbar from "./Navbar";

type AccountGateProps = {
  children: (user: AccountUser) => ReactNode;
};

export default function AccountGate({ children }: AccountGateProps) {
  const { language } = useLanguage();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState<AccountUser | null>(() => getAccountUser());
  const [isCreatingAccount, setIsCreatingAccount] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetStep, setResetStep] = useState<"request" | "confirm" | "success" | "error">("request");
  const [resetMessage, setResetMessage] = useState("");
  const [resetError, setResetError] = useState("");
  const [isResetSubmitting, setIsResetSubmitting] = useState(false);
  const [email, setEmail] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetPassword, setResetPassword] = useState("");
  const [resetPasswordConfirmation, setResetPasswordConfirmation] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [rut, setRut] = useState("");
  const [address, setAddress] = useState("");
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

  useEffect(() => {
    const tokenFromUrl = searchParams.get("resetToken");
    const emailFromUrl = searchParams.get("email");

    if (!tokenFromUrl) return;

    setResetToken(tokenFromUrl);
    setResetEmail(emailFromUrl ?? "");
    setResetStep("confirm");
    setResetMessage("");
    setResetError("");
    setIsResetModalOpen(true);
  }, [searchParams]);

  async function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!email.trim() || !password.trim()) {
      setError(language === "en" ? "Enter your email and password to continue." : "Ingresa tu correo y contraseña para continuar.");
      return;
    }

    if (isCreatingAccount) {
      if (!name.trim() || !phone.trim() || !address.trim()) {
        setError(language === "en" ? "Enter your name, phone, and address to create your account." : "Ingresa tu nombre, telefono y direccion para crear tu cuenta.");
        return;
      }

      if (password !== passwordConfirmation) {
        setError(language === "en" ? "Passwords do not match." : "Las contraseñas no coinciden.");
        return;
      }
    }

    setError("");

    try {
      const nextUser = isCreatingAccount
        ? await registerAccount({
            name: name.trim(),
            email: email.trim(),
            password,
            phone: phone.trim(),
            rut: rut.trim(),
            address: address.trim(),
          })
        : await loginAccount(email.trim(), password);
      setUser(nextUser);
      setPassword("");
      setPasswordConfirmation("");
    } catch (error) {
      setError(error instanceof Error ? error.message : language === "en" ? "Could not sign in." : "No se pudo iniciar sesion.");
    }
  }

  function toggleAccountMode() {
    setError("");
    setPassword("");
    setPasswordConfirmation("");
    setIsCreatingAccount((current) => !current);
  }

  function openResetModal() {
    setResetEmail(email);
    setResetToken("");
    setResetPassword("");
    setResetPasswordConfirmation("");
    setResetMessage("");
    setResetError("");
    setResetStep("request");
    setIsResetModalOpen(true);
  }

  function closeResetModal() {
    setIsResetModalOpen(false);
  }

  async function handlePasswordReset(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetEmail.trim()) {
      setResetError(language === "en" ? "Enter your email." : "Ingresa tu correo.");
      return;
    }

    setIsResetSubmitting(true);
    setResetError("");

    try {
      await requestPasswordReset(resetEmail.trim());
      setResetStep("confirm");
      setResetMessage(language === "en" ? "If the email exists, a recovery token was sent." : "Si el correo existe, enviamos un token de recuperacion.");
    } catch (error) {
      setResetError(error instanceof Error ? error.message : language === "en" ? "Could not send the token." : "No se pudo enviar el token.");
    } finally {
      setIsResetSubmitting(false);
    }
  }

  async function handlePasswordResetConfirm(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!resetEmail.trim() || !resetToken.trim() || !resetPassword.trim()) {
      setResetError(language === "en" ? "Enter email, token, and new password." : "Ingresa correo, token y nueva contrasena.");
      return;
    }

    if (resetPassword !== resetPasswordConfirmation) {
      setResetError(language === "en" ? "Passwords do not match." : "Las contrasenas no coinciden.");
      return;
    }

    setIsResetSubmitting(true);
    setResetError("");

    try {
      await confirmPasswordReset(resetEmail.trim(), resetToken.trim(), resetPassword);
      setResetMessage(language === "en" ? "Password updated. You can sign in now." : "Contrasena actualizada. Ya puedes iniciar sesion.");
      setEmail(resetEmail.trim());
      setPassword("");
      setResetToken("");
      setResetPassword("");
      setResetPasswordConfirmation("");
      setResetStep("success");
    } catch (error) {
      setResetError(error instanceof Error ? error.message : language === "en" ? "Could not reset your password." : "No se pudo restaurar la contrasena.");
      setResetStep("error");
    } finally {
      setIsResetSubmitting(false);
    }
  }

  function returnToPasswordResetConfirm() {
    setResetError("");
    setResetMessage("");
    setResetStep("confirm");
  }

  if (user) {
    return <>{children(user)}</>;
  }

  return (
    <>
      <Navbar />

      <main className="account-login-page">
        <section className={isCreatingAccount ? "account-login-card account-login-card-create" : "account-login-card"}>
          <span className="account-kicker">{language === "en" ? "Customer area" : "Área cliente"}</span>
          <h1>{isCreatingAccount ? (language === "en" ? "Create account" : "Crea tu cuenta") : (language === "en" ? "Sign in" : "Inicia sesion")}</h1>
          <p>
            {isCreatingAccount
              ? (language === "en" ? "Create an account to save your details and review future orders." : "Crea una cuenta para guardar tus datos y revisar tus pedidos.")
              : (language === "en" ? "Access your profile, orders, and quotes." : "Accede para revisar tu perfil, pedidos y cotizaciones.")}
          </p>

          <form className={isCreatingAccount ? "account-create-form" : undefined} onSubmit={handleLogin}>
            {isCreatingAccount && (
              <>
                <label>
                  <span>{language === "en" ? "Full name" : "Nombre completo"}</span>
                  <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    autoComplete="name"
                    required
                  />
                </label>
                <label>
                  <span>{language === "en" ? "Phone" : "Telefono"}</span>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(event) => setPhone(event.target.value)}
                    autoComplete="tel"
                    required
                  />
                </label>
              </>
            )}
            <label>
              <span>{language === "en" ? "Email" : "Correo electrónico"}</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
              />
            </label>
            {isCreatingAccount && (
              <label>
                <span>{language === "en" ? "RUT" : "RUT"}</span>
                <input
                  type="text"
                  value={rut}
                  onChange={(event) => setRut(event.target.value)}
                  autoComplete="off"
                />
              </label>
            )}
            {isCreatingAccount && (
              <label className="account-form-wide">
                <span>{language === "en" ? "Address" : "Direccion"}</span>
                <input
                  type="text"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  autoComplete="street-address"
                  required
                />
              </label>
            )}
            <label>
              <span>{language === "en" ? "Password" : "Contraseña"}</span>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete={isCreatingAccount ? "new-password" : "current-password"}
                minLength={6}
                required
              />
            </label>
            {isCreatingAccount && (
              <label>
                <span>{language === "en" ? "Confirm password" : "Confirmar contraseña"}</span>
                <input
                  type="password"
                  value={passwordConfirmation}
                  onChange={(event) => setPasswordConfirmation(event.target.value)}
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
              </label>
            )}
            {!isCreatingAccount && (
              <a
                className="account-forgot-link"
                href="#recuperar-contrasena"
                onClick={(event) => {
                  event.preventDefault();
                  openResetModal();
                }}
              >
                {language === "en" ? "Forgot your password?" : "Recuperar contraseña"}
              </a>
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

            {resetStep === "success" && (
              <div className="account-reset-result" role="status">
                <strong>{language === "en" ? "Password updated" : "Contrasena actualizada"}</strong>
                <p>{resetMessage}</p>
                <button type="button" onClick={closeResetModal}>
                  {language === "en" ? "Sign in" : "Iniciar sesion"}
                </button>
              </div>
            )}

            {resetStep === "error" && (
              <div className="account-reset-result account-reset-result-error" role="alert">
                <strong>{language === "en" ? "Could not update password" : "No se pudo actualizar la contrasena"}</strong>
                <p>{resetError}</p>
                <button type="button" onClick={returnToPasswordResetConfirm}>
                  {language === "en" ? "Try again" : "Intentar de nuevo"}
                </button>
              </div>
            )}

            {resetStep === "request" ? (
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
                {resetError && <strong className="account-login-error">{resetError}</strong>}
                {resetMessage && <strong className="account-reset-message">{resetMessage}</strong>}
                <button type="submit" disabled={isResetSubmitting}>
                  {isResetSubmitting ? (language === "en" ? "Sending..." : "Enviando...") : (language === "en" ? "Send token" : "Enviar token")}
                </button>
              </form>
            ) : resetStep === "confirm" ? (
              <form onSubmit={handlePasswordResetConfirm}>
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
                <label>
                  <span>Token</span>
                  <input
                    type="text"
                    value={resetToken}
                    onChange={(event) => setResetToken(event.target.value)}
                    autoComplete="one-time-code"
                    required
                  />
                </label>
                <label>
                  <span>{language === "en" ? "New password" : "Nueva contrasena"}</span>
                  <input
                    type="password"
                    value={resetPassword}
                    onChange={(event) => setResetPassword(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </label>
                <label>
                  <span>{language === "en" ? "Confirm password" : "Confirmar contrasena"}</span>
                  <input
                    type="password"
                    value={resetPasswordConfirmation}
                    onChange={(event) => setResetPasswordConfirmation(event.target.value)}
                    autoComplete="new-password"
                    minLength={6}
                    required
                  />
                </label>
                {resetError && <strong className="account-login-error">{resetError}</strong>}
                {resetMessage && <strong className="account-reset-message">{resetMessage}</strong>}
                <button type="submit" disabled={isResetSubmitting}>
                  {isResetSubmitting ? (language === "en" ? "Updating..." : "Actualizando...") : (language === "en" ? "Reset password" : "Restaurar contrasena")}
                </button>
                <button className="account-reset-secondary" type="button" onClick={() => setResetStep("request")}>
                  {language === "en" ? "Send a new token" : "Enviar otro token"}
                </button>
              </form>
            ) : null}
          </section>
        </div>
      )}

      <Footer />
    </>
  );
}
