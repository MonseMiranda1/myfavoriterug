import "./Categories.css";
import banner from "../../assets/banner.png";
import { useLanguage } from "../../i18n";

export default function Categories() {
  const { t } = useLanguage();
  const categories = [
    { title: t("categories.popular"), pos: "74% 48%" },
    { title: t("categories.sneakers"), pos: "69% 31%" },
    { title: t("categories.anime"), pos: "78% 43%" },
    { title: t("categories.logos"), pos: "62% 51%" },
    { title: t("categories.pets"), pos: "86% 40%" },
  ];

  return (
    <section className="categories-section">
      <div className="section-heading">
        <h2>{t("categories.title")}</h2>
        <a href="/tienda">{t("categories.viewAll")} <span aria-hidden="true">&rarr;</span></a>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.title}>
            <div
              className="category-image"
              style={{ backgroundImage: `url(${banner})`, backgroundPosition: category.pos }}
            />
            <h3>{category.title}</h3>
            <a href="/tienda">{t("categories.viewMore")} <span aria-hidden="true">&rarr;</span></a>
          </article>
        ))}
      </div>

      <div className="promo-grid">
        <article className="why-card">
          <h3>{t("categories.why")}</h3>
          <ul>
            <li>{t("categories.quality")}</li>
            <li>{t("categories.colors")}</li>
            <li>{t("categories.custom")}</li>
            <li>{t("categories.support")}</li>
            <li>{t("categories.clients")}</li>
          </ul>
        </article>

        <article className="community-card">
          <div>
            <h3>{t("categories.community")}</h3>
            <p>{t("categories.communityText")}</p>
            <a className="instagram-link" href="https://www.instagram.com/myfavoriterug/" target="_blank" rel="noreferrer">@myfavoriterug</a>
          </div>
          <span className="good-vibes">GOOD<br />VIBES</span>
        </article>
      </div>
    </section>
  );
}
