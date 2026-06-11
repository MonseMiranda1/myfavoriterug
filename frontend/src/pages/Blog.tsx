import "./Blog.css"
import { Link } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { blogPosts } from "../data/blogPosts";
import { useLanguage } from "../i18n";

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
