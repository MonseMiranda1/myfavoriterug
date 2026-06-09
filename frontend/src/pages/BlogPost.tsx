import { Link, useParams } from "react-router-dom";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { blogPosts } from "../data/blogPosts";
import { useLanguage } from "../i18n";

export default function BlogPost() {
  const { language, t } = useLanguage();
  const { slug } = useParams();
  const post = blogPosts.find((item) => item.slug === slug);

  return (
    <>
      <Navbar />

      <main className="content-page">
        {post ? (
          <article className="content-article">
            <span className="store-kicker">{language === "en" ? post.categoryEn : post.category}</span>
            <h1>{language === "en" ? post.titleEn : post.title}</h1>
            {(language === "en" ? post.contentEn : post.content).map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
            <Link to="/blog" className="cart-secondary-link">{t("common.backToBlog")}</Link>
          </article>
        ) : (
          <section className="content-article">
            <h1>{t("common.notFound")}</h1>
            <p>{t("common.notFoundText")}</p>
            <Link to="/blog" className="cart-primary-link">{t("common.viewBlog")}</Link>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
