import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  CATEGORIES_UPDATED_EVENT,
  getCategories,
  getProducts,
  PRODUCTS_UPDATED_EVENT,
  type Category,
  type Product,
} from "../services/api";
import Navbar from "../components/Navbar/Navbar";
import Footer from "../components/Footer/Footer";
import { Link, useSearchParams } from "react-router-dom";
import { useLanguage } from "../i18n";
import fallbackProductImage from "../assets/banner.png";
import { getPriceWithTax } from "../services/cart";

const PRODUCTS_PER_PAGE = 12;

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
  if (product.category?.trim()) return product.category.trim();
  if (product.collection?.trim()) return product.collection.trim();

  const name = product.name.toLowerCase();

  if (name.includes("anime")) return "Anime Collection";
  if (name.includes("gaming") || name.includes("game"))
    return "Gaming Collection";
  if (name.includes("kawaii")) return "Kawaii Collection";
  if (name.includes("minimal")) return "Minimal Collection";

  return "Custom Rugs";
}

function normalizeCategory(category: string) {
  return category
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function productMatchesCategory(product: Product, selectedCategory: string) {
  if (selectedCategory === "Todas") return true;
  if (selectedCategory === "New Arrivals") return Boolean(product.newArrival);
  if (selectedCategory === "Best Sellers") return Boolean(product.bestSeller);

  const normalizedSelectedCategory = normalizeCategory(selectedCategory);

  return [product.category, product.collection, getProductCategory(product)]
    .filter((category): category is string => Boolean(category?.trim()))
    .some(
      (category) => normalizeCategory(category) === normalizedSelectedCategory,
    );
}

function getCategoryLabel(
  category: string,
  t: ReturnType<typeof useLanguage>["t"],
) {
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
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [productsError, setProductsError] = useState("");
  const [categories, setCategories] = useState<Category[]>(() =>
    getCategories(),
  );
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [purchaseType, setPurchaseType] = useState("Todos");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const searchParamValue = searchParams.get("buscar") ?? "";
  const searchTerm = searchParams.get("buscar")?.trim().toLowerCase() ?? "";
  const query = activeSearch.trim().toLowerCase() || searchTerm;
  const categoryOptions = useMemo(
    () => [
      "Todas",
      ...categories
        .filter((category) => category.status === "Visible")
        .map((category) => category.name),
      "New Arrivals",
      "Best Sellers",
    ],
    [categories],
  );

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const isVisible = product.availability !== "Oculto";
        const matchesSearch = query
          ? product.name.toLowerCase().includes(query) ||
            String(product.id).toLowerCase().includes(query)
          : true;
        const matchesCategory =
          productMatchesCategory(product, selectedCategory);
        const isQuoteProduct =
          product.availability === "Personalizado" || product.price === 0;
        const matchesType =
          purchaseType === "Todos" ||
          (purchaseType === "Para cotizar"
            ? isQuoteProduct
            : !isQuoteProduct && product.price > 0);

        return isVisible && matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, purchaseType, query, selectedCategory, sortBy]);
  const totalPages = Math.max(
    1,
    Math.ceil(filteredProducts.length / PRODUCTS_PER_PAGE),
  );
  const paginatedProducts = useMemo(() => {
    const startIndex = (currentPage - 1) * PRODUCTS_PER_PAGE;
    return filteredProducts.slice(startIndex, startIndex + PRODUCTS_PER_PAGE);
  }, [currentPage, filteredProducts]);

  useEffect(() => {
    setCurrentPage(1);
  }, [products, purchaseType, query, selectedCategory, sortBy]);

  useEffect(() => {
    const refreshProducts = async () => {
      setIsLoadingProducts(true);
      setProductsError("");

      try {
        const response = await getProducts();
        setProducts(response.data);
      } catch (error) {
        setProducts([]);
        setProductsError(
          error instanceof Error
            ? error.message
            : "No se pudieron cargar los productos de la tienda.",
        );
      } finally {
        setIsLoadingProducts(false);
      }
    };
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

        <button
          type="button"
          className="store-filter-toggle"
          onClick={() => setShowFilters((value) => !value)}
        >
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
                      className={
                        selectedCategory === category ? "is-active" : ""
                      }
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
              <div className="store-sort">
                <span>{t("store.sortBy")}</span>
                <select
                  value={sortBy}
                  onChange={(event) => setSortBy(event.target.value)}
                >
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {t(option.labelKey as never)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {!isLoadingProducts && !productsError && (
              <p className="store-result-count">
                {filteredProducts.length}{" "}
                {filteredProducts.length === 1
                  ? t("store.productSingular")
                  : t("store.productPlural")}
              </p>
            )}

            {query && (
              <p className="store-search-result">
                {t("store.resultsFor")}{" "}
                <strong>{activeSearch || searchParams.get("buscar")}</strong>
              </p>
            )}

            {!isLoadingProducts && !productsError && (
              <div className="store-product-grid">
                {paginatedProducts.map((product) => (
                  <Link
                    to={`/producto/${product.id}`}
                    state={{ product }}
                    className="store-product-card"
                    key={product.id}
                  >
                    <span className="store-product-image">
                      <img
                        src={product.image || fallbackProductImage}
                        alt={product.name}
                        onError={(event) => {
                          event.currentTarget.src = fallbackProductImage;
                        }}
                      />
                    </span>
                    <span className="store-product-category">
                      {getCategoryLabel(getProductCategory(product), t)}
                    </span>
                    <strong>{product.name}</strong>
                    <span className="store-product-price">
                      {product.availability === "Personalizado" ||
                      product.price === 0 ? (
                        t("store.quote")
                      ) : (
                        <>
                          <span>{formatPrice(getPriceWithTax(product.price))}</span>
                          <small>{t("store.netPrice")}</small>
                        </>
                      )}
                    </span>
                    {product.availability && (
                      <span className="store-product-availability">
                        {product.availability}
                      </span>
                    )}
                  </Link>
                ))}
              </div>
            )}

            {!isLoadingProducts &&
              !productsError &&
              filteredProducts.length > 0 &&
              totalPages > 1 && (
                <nav
                  className="store-pagination"
                  aria-label={t("store.pagination")}
                >
                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page - 1)}
                    disabled={currentPage === 1}
                  >
                    {t("store.previous")}
                  </button>

                  {Array.from({ length: totalPages }, (_, index) => {
                    const page = index + 1;

                    return (
                      <button
                        type="button"
                        key={page}
                        className={currentPage === page ? "is-active" : ""}
                        onClick={() => setCurrentPage(page)}
                        aria-current={currentPage === page ? "page" : undefined}
                        aria-label={`${t("store.page")} ${page}`}
                      >
                        {page}
                      </button>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => setCurrentPage((page) => page + 1)}
                    disabled={currentPage === totalPages}
                  >
                    {t("store.next")}
                  </button>
                </nav>
              )}

            {isLoadingProducts && (
              <p className="store-empty-result">{t("common.loading")}</p>
            )}

            {!isLoadingProducts && productsError && (
              <p className="store-empty-result">{productsError}</p>
            )}

            {!isLoadingProducts &&
              !productsError &&
              filteredProducts.length === 0 && (
                <p className="store-empty-result">{t("store.empty")}</p>
              )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
