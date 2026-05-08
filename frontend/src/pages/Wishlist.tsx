import AccountGate from "../components/AccountGate";
import AccountSidebar from "../components/AccountSidebar";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { useLanguage } from "../i18n";

export default function Wishlist() {
  const { t } = useLanguage();

  return (
    <AccountGate>
      {(user) => (
        <>
          <Navbar />
          <main className="account-page">
            <div className="account-shell">
                <AccountSidebar activeSection="wishlist" user={user} />
                <section className="account-card">
                  <h2>Wishlist</h2>
                <p>{t("account.wishlistText")}</p>
              </section>
            </div>
          </main>
          <Footer />
        </>
      )}
    </AccountGate>
  );
}
