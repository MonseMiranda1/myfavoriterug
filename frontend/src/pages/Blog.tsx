import { Link } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { blogPosts } from "../data/blogPosts";
import { useLanguage } from "../i18n";

const categories = [
  { labelKey: "blog.all", to: "/blog" },
  { labelKey: "Rug Care Tips", to: "/blog/cuidado-alfombras" },
  { labelKey: "blog.decor", to: "/blog/decoracion" },
  { labelKey: "blog.trends", to: "/blog/tendencias" },
  { labelKey: "blog.tutorials", to: "/blog/tutoriales" },
];

export default function Blog() {
  const { language, t } = useLanguage();

  return (
    <>
      <Navbar />

      <main className="content-page">
        <header className="store-heading">
          <span className="store-kicker">Blog</span>
          <h1>{t("blog.title")}</h1>
          <p>{t("blog.subtitle")}</p>
        </header>

        <div className="filter-tabs">
          {categories.map((category) => (
            <Link key={category.labelKey} to={category.to}>
              {category.labelKey === "Rug Care Tips" ? category.labelKey : t(category.labelKey as never)}
            </Link>
          ))}
        </div>

        <section className="content-grid">
          {blogPosts.map((post) => (
            <article className="content-card text-card" key={post.slug}>
              <span>{language === "en" ? post.categoryEn : post.category}</span>
              <h2>{language === "en" ? post.titleEn : post.title}</h2>
              <p>{language === "en" ? post.excerptEn : post.excerpt}</p>
              <Link to={`/blog/${post.slug}`}>{t("blog.read")} <span aria-hidden="true">&rarr;</span></Link>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
