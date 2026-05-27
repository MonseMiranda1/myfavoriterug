import { useEffect, useMemo, useState, type FormEvent } from "react";
import { CATEGORIES_UPDATED_EVENT, getCategories, getFallbackProducts, getProducts, PRODUCTS_UPDATED_EVENT, type Category, type Product } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n";

const sortOptions = [
  { value: "name-asc", labelKey: "store.nameAsc" },
  { value: "name-desc", labelKey: "store.nameDesc" },
  { value: "price-asc", labelKey: "store.priceAsc" },
  { value: "price-desc", labelKey: "store.priceDesc" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductCategory(product: Product) {
  if (product.newArrival) return "New Arrivals";
  if (product.bestSeller) return "Best Sellers";
  if (product.category) return product.category;
  if (product.collection) return product.collection;

  const name = product.name.toLowerCase();

  if (name.includes("anime")) return "Anime Collection";
  if (name.includes("gaming") || name.includes("game")) return "Gaming Collection";
  if (name.includes("kawaii")) return "Kawaii Collection";
  if (name.includes("minimal")) return "Minimal Collection";

  return "Custom Rugs";
}

function getCategoryLabel(category: string, t: ReturnType<typeof useLanguage>["t"]) {
  if (category === "Todas") return t("store.all");
  if (category === "Custom Rugs") return t("store.customRugs");
  if (category === "Anime Collection") return t("store.anime");
  if (category === "Gaming Collection") return t("store.gaming");
  if (category === "Kawaii Collection") return t("store.kawaii");
  if (category === "Minimal Collection") return t("store.minimal");
  if (category === "New Arrivals") return t("store.new");
  if (category === "Best Sellers") return t("store.best");
  return category;
}

export default function Store() {
  const { t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [products, setProducts] = useState<Product[]>(() => getFallbackProducts());
  const [categories, setCategories] = useState<Category[]>(() => getCategories());
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [purchaseType, setPurchaseType] = useState("Todos");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(true);
  const searchParamValue = searchParams.get("buscar") ?? "";
  const searchTerm = searchParams.get("buscar")?.trim().toLowerCase() ?? "";
  const query = activeSearch.trim().toLowerCase() || searchTerm;
  const categoryOptions = useMemo(
    () => ["Todas", ...categories.filter((category) => category.status === "Visible").map((category) => category.name), "New Arrivals", "Best Sellers"],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const isVisible = product.availability !== "Oculto";
        const matchesSearch = query
          ? product.name.toLowerCase().includes(query) || String(product.id).toLowerCase().includes(query)
          : true;
        const matchesCategory =
          selectedCategory === "Todas" ||
          getProductCategory(product) === selectedCategory ||
          (selectedCategory === "New Arrivals" && product.newArrival) ||
          (selectedCategory === "Best Sellers" && product.bestSeller);
        const isQuoteProduct = product.availability === "Personalizado" || product.price === 0;
        const matchesType =
          purchaseType === "Todos" ||
          (purchaseType === "Para cotizar" ? isQuoteProduct : !isQuoteProduct && product.price > 0);

        return isVisible && matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, purchaseType, query, selectedCategory, sortBy]);

  useEffect(() => {
    const refreshProducts = () => getProducts().then((res) => setProducts(res.data));
    const refreshCategories = () => setCategories(getCategories());

    refreshProducts();
    refreshCategories();
    window.addEventListener(PRODUCTS_UPDATED_EVENT, refreshProducts);
    window.addEventListener(CATEGORIES_UPDATED_EVENT, refreshCategories);

    return () => {
      window.removeEventListener(PRODUCTS_UPDATED_EVENT, refreshProducts);
      window.removeEventListener(CATEGORIES_UPDATED_EVENT, refreshCategories);
    };
  }, []);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setActiveSearch(String(formData.get("search") ?? ""));
  }

  return (
    <>
      <Navbar />

      <main className="store-page">
        <header className="store-heading">
          <span className="store-kicker">{t("store.kicker")}</span>
          <h1>{t("store.title")}</h1>
          <p>{t("store.subtitle")}</p>
        </header>

        <button type="button" className="store-filter-toggle" onClick={() => setShowFilters((value) => !value)}>
          <span aria-hidden="true">{showFilters ? "\u2039" : "\u203a"}</span>
          {showFilters ? t("store.hideFilters") : t("store.showFilters")}
        </button>

        <div className={`store-shell ${showFilters ? "" : "filters-hidden"}`}>
          {showFilters && (
            <aside className="store-sidebar" aria-label="Filtros de tienda">
              <section className="store-filter-card">
                <h2>{t("store.purchaseType")}</h2>
                {[
                  { value: "Todos", label: t("store.allTypes") },
                  { value: "Venta inmediata", label: t("store.ready") },
                  { value: "Para cotizar", label: t("store.quote") },
                ].map((type) => (
                  <label key={type.value}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value={type.value}
                      checked={purchaseType === type.value}
                      onChange={(event) => setPurchaseType(event.target.value)}
                    />
                    <span>{type.label}</span>
                  </label>
                ))}
              </section>

              <section className="store-filter-card">
                <h2>{t("store.categories")}</h2>
                <div className="store-category-list">
                  {categoryOptions.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={selectedCategory === category ? "is-active" : ""}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {getCategoryLabel(category, t)}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          )}

          <section className="store-results" aria-label="Productos">
            <form className="store-search" onSubmit={handleSearch}>
              <input
                key={searchParamValue}
                name="search"
                type="search"
                defaultValue={searchParamValue}
                placeholder={t("store.searchPlaceholder")}
              />
              <button type="submit">{t("store.search")}</button>
            </form>

            <div className="store-actions-row">
              <Link to="/personaliza" className="store-catalog-button">
                {t("store.catalog")}
              </Link>
              <div className="store-sort">
                <span>{t("store.sortBy")}</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey as never)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="store-result-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? t("store.productSingular") : t("store.productPlural")}
            </p>

            {query && (
              <p className="store-search-result">
                {t("store.resultsFor")} <strong>{activeSearch || searchParams.get("buscar")}</strong>
              </p>
            )}

            <div className="store-product-grid">
              {filteredProducts.map((product) => (
                <Link to={`/producto/`} state={{ product }} className="store-product-card" key={product.id}>
                  <span className="store-product-image">
                    <img src={product.image} alt={product.name} />
                  </span>
                  <span className="store-product-category">{getCategoryLabel(getProductCategory(product), t)}</span>
                  <strong>{product.name}</strong>
                  <span className="store-product-price">
                    {product.availability === "Personalizado" || product.price === 0 ? t("store.quote") : formatPrice(product.price)}
                  </span>
                  {product.availability && <span className="store-product-availability">{product.availability}</span>}
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="store-empty-result">{t("store.empty")}</p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
