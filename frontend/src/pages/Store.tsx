import { useEffect, useMemo, useState, type FormEvent } from "react";
import { getProducts, type Product } from "../services/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { Link, useSearchParams } from "react-router-dom";

const categories = [
  "Todas",
  "Alfombras personalizadas",
  "Personajes",
  "Logos",
  "Mascotas",
  "Decoracion",
  "Regalos",
];

const sortOptions = [
  { value: "name-asc", label: "Nombre: A - Z" },
  { value: "name-desc", label: "Nombre: Z - A" },
  { value: "price-asc", label: "Precio: menor a mayor" },
  { value: "price-desc", label: "Precio: mayor a menor" },
];

function formatPrice(price: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(price);
}

function getProductCategory(product: Product) {
  const name = product.name.toLowerCase();

  if (name.includes("logo") || name.includes("marca")) return "Logos";
  if (name.includes("mascota") || name.includes("perro") || name.includes("gato")) return "Mascotas";
  if (name.includes("personaje") || name.includes("anime") || name.includes("caricatura")) return "Personajes";
  if (name.includes("regalo")) return "Regalos";
  if (name.includes("decor")) return "Decoracion";

  return "Alfombras personalizadas";
}

export default function Store() {
  const [products, setProducts] = useState<Product[]>([]);
  const [searchValue, setSearchValue] = useState("");
  const [activeSearch, setActiveSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Todas");
  const [purchaseType, setPurchaseType] = useState("Todos");
  const [sortBy, setSortBy] = useState("name-asc");
  const [showFilters, setShowFilters] = useState(true);
  const [searchParams] = useSearchParams();
  const searchTerm = searchParams.get("buscar")?.trim().toLowerCase() ?? "";
  const query = activeSearch.trim().toLowerCase() || searchTerm;

  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        const matchesSearch = query
          ? product.name.toLowerCase().includes(query) || String(product.id).toLowerCase().includes(query)
          : true;
        const matchesCategory = selectedCategory === "Todas" || getProductCategory(product) === selectedCategory;
        const matchesType = purchaseType === "Todos" || purchaseType === "Para cotizar" || product.price > 0;

        return matchesSearch && matchesCategory && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === "name-desc") return b.name.localeCompare(a.name);
        if (sortBy === "price-asc") return a.price - b.price;
        if (sortBy === "price-desc") return b.price - a.price;
        return a.name.localeCompare(b.name);
      });
  }, [products, purchaseType, query, selectedCategory, sortBy]);

  useEffect(() => {
    getProducts().then((res) => setProducts(res.data));
  }, []);

  useEffect(() => {
    setSearchValue(searchParams.get("buscar") ?? "");
  }, [searchParams]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setActiveSearch(searchValue);
  }

  return (
    <>
      <Navbar />

      <main className="store-page">
        <header className="store-heading">
          <span className="store-kicker">Catalogo</span>
          <h1>Tienda</h1>
          <p>Explora categorias y cotiza productos hechos a mano.</p>
        </header>

        <button type="button" className="store-filter-toggle" onClick={() => setShowFilters((value) => !value)}>
          <span aria-hidden="true">{showFilters ? "\u2039" : "\u203a"}</span>
          {showFilters ? "Ocultar filtros" : "Mostrar filtros"}
        </button>

        <div className={`store-shell ${showFilters ? "" : "filters-hidden"}`}>
          {showFilters && (
            <aside className="store-sidebar" aria-label="Filtros de tienda">
              <section className="store-filter-card">
                <h2>Tipo de compra</h2>
                {["Todos", "Venta inmediata", "Para cotizar"].map((type) => (
                  <label key={type}>
                    <input
                      type="radio"
                      name="purchaseType"
                      value={type}
                      checked={purchaseType === type}
                      onChange={(event) => setPurchaseType(event.target.value)}
                    />
                    <span>{type}</span>
                  </label>
                ))}
              </section>

              <section className="store-filter-card">
                <h2>Categorias</h2>
                <div className="store-category-list">
                  {categories.map((category) => (
                    <button
                      type="button"
                      key={category}
                      className={selectedCategory === category ? "is-active" : ""}
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </section>
            </aside>
          )}

          <section className="store-results" aria-label="Productos">
            <form className="store-search" onSubmit={handleSearch}>
              <input
                type="search"
                value={searchValue}
                onChange={(event) => setSearchValue(event.target.value)}
                placeholder="Buscar por nombre, SKU o etiqueta..."
              />
              <button type="submit">Buscar</button>
            </form>

            <div className="store-actions-row">
              <Link to="/personaliza" className="store-catalog-button">
                Ver catalogo
              </Link>
              <div className="store-sort">
                <span>Ordenar por:</span>
                <select value={sortBy} onChange={(event) => setSortBy(event.target.value)}>
                  {sortOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <p className="store-result-count">
              {filteredProducts.length} {filteredProducts.length === 1 ? "producto" : "productos"}
            </p>

            {query && (
              <p className="store-search-result">
                Resultados para <strong>{activeSearch || searchParams.get("buscar")}</strong>
              </p>
            )}

            <div className="store-product-grid">
              {filteredProducts.map((product) => (
                <Link to={`/producto/${product.id}`} className="store-product-card" key={product.id}>
                  <span className="store-product-image">
                    <img src={product.image} alt={product.name} />
                  </span>
                  <span className="store-product-category">{getProductCategory(product)}</span>
                  <strong>{product.name}</strong>
                  <span className="store-product-price">{formatPrice(product.price)}</span>
                </Link>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <p className="store-empty-result">No encontramos productos con esa busqueda.</p>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </>
  );
}
