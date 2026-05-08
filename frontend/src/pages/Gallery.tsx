import { useMemo, useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import { galleryItems, type GalleryCategory } from "../data/gallery";
import { useLanguage } from "../i18n";

const filters: Array<GalleryCategory | "Todas"> = [
  "Todas",
  "Customer Photos",
  "Behind The Scenes",
  "Video Process",
  "Finished Rugs",
];

export default function Gallery({ initialCategory = "Todas" }: { initialCategory?: GalleryCategory | "Todas" }) {
  const { language, t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<GalleryCategory | "Todas">(initialCategory);
  const items = useMemo(
    () => galleryItems.filter((item) => activeFilter === "Todas" || item.category === activeFilter),
    [activeFilter],
  );

  return (
    <>
      <Navbar />

      <main className="content-page">
        <header className="store-heading">
          <span className="store-kicker">{t("gallery.kicker")}</span>
          <h1>{t("gallery.title")}</h1>
          <p>{t("gallery.subtitle")}</p>
        </header>

        <div className="filter-tabs" aria-label={t("gallery.filters")}>
          {filters.map((filter) => (
            <button
              type="button"
              key={filter}
              className={activeFilter === filter ? "is-active" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "Todas" ? t("gallery.all") : filter === "Customer Photos" ? t("gallery.customers") : filter === "Behind The Scenes" ? t("gallery.behind") : filter === "Video Process" ? t("gallery.video") : t("gallery.finished")}
            </button>
          ))}
        </div>

        <section className="content-grid">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <span>{item.category}</span>
              <h2>{language === "en" ? item.titleEn : item.title}</h2>
              <p>{language === "en" ? item.descriptionEn : item.description}</p>
            </article>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
