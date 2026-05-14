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

function getCategoryLabel(category: GalleryCategory, t: ReturnType<typeof useLanguage>["t"]) {
  if (category === "Customer Photos") return t("gallery.customers");
  if (category === "Behind The Scenes") return t("gallery.behind");
  if (category === "Video Process") return t("gallery.video");
  return t("gallery.finished");
}

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
              {filter === "Todas" ? t("gallery.all") : getCategoryLabel(filter, t)}
            </button>
          ))}
        </div>

        <section className="content-grid">
          {items.map((item) => (
            <article className="content-card" key={item.id}>
              <img src={item.image} alt={item.title} />
              <span>{getCategoryLabel(item.category, t)}</span>
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
