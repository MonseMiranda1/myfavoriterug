import "./Gallery.css";
import { useMemo, useState } from "react";
import Footer from "../components/Footer/Footer";
import Navbar from "../components/Navbar/Navbar";
import { galleryItems, type GalleryCategory } from "../data/gallery";
import { useLanguage } from "../i18n";
import InstagramReel from "../components/InstagramReel/InstagramReel";
import YouTubeVideo from "../components/YouTubeVideo/YouTubeVideo";

interface ActiveModalItem {
  type: "image" | "instagram" | "youtube";
  src: string;
  title: string;
  videoUrl?: string;
}

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
  const [modalItem, setModalItem] = useState<ActiveModalItem | null>(null);

  const items = useMemo(
    () => galleryItems.filter((item) => activeFilter === "Todas" || item.category === activeFilter),
    [activeFilter],
  );

  const handleItemClick = (item: any) => {
    const titleText = language === "en" ? item.titleEn : item.title;
    if ((item.type === "instagram" || item.type === "youtube") && item.videoUrl) {
      setModalItem({ 
        type: item.type, 
        src: item.videoUrl, 
        title: titleText,
        videoUrl: item.videoUrl 
      });
    } else {
      setModalItem({ type: "image", src: item.image, title: titleText });
    }
  };

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
              className={activeFilter === filter ? "is-open-tab" : ""}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === "Todas" ? t("gallery.all") : getCategoryLabel(filter, t)}
            </button>
          ))}
        </div>

        <section className="content-grid">
          {items.map((item) => (
            <article 
              className="content-card" 
              key={item.id}
              onClick={() => handleItemClick(item)}
              style={{ cursor: "pointer" }}
            >
              <div className="card-image-wrapper">
                <img src={item.image} alt={language === "en" ? item.titleEn : item.title} />
                {(item.type === "instagram" || item.type === "youtube") && (
                  <div className="play-overlay" aria-hidden="true">▶</div>
                )}
              </div>
              <span className="card-badge">{getCategoryLabel(item.category, t)}</span>
              <h2>{language === "en" ? item.titleEn : item.title}</h2>
              <p>{language === "en" ? item.descriptionEn : item.description}</p>
            </article>
          ))}
        </section>
      </main>

      {modalItem && (
        <div className="gallery-modal-backdrop" onClick={() => setModalItem(null)}>
          <div className="gallery-modal-content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="gallery-modal-close" 
              onClick={() => setModalItem(null)}
              aria-label="Cerrar"
            >
              &times;
            </button>
            {modalItem.type === "image" && (
              <img src={modalItem.src} alt={modalItem.title} className="gallery-modal-media" />
            )}

            {modalItem.type === "instagram" && (
              <div style={{ width: '100%', height: '70vh', position: 'relative' }}>
                <InstagramReel url={modalItem.videoUrl || modalItem.src} />
              </div>
            )}

            {modalItem.type === "youtube" && (
              <div style={{ width: '100%', height: '70vh', position: 'relative' }}>
                <YouTubeVideo url={modalItem.videoUrl || modalItem.src} />
              </div>
            )}
            
            <div className="gallery-modal-caption">
              <h3>{modalItem.title}</h3>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}
