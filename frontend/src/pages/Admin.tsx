import { useEffect, useState, type FormEvent } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import adminIcon from "../assets/icons/admin.png";
import cajaIcon from "../assets/icons/caja.png";
import carritoIcon from "../assets/icons/carrito.png";
import compraIcon from "../assets/icons/compra.png";
import envioIcon from "../assets/icons/envio.png";
import monedaIcon from "../assets/icons/moneda.png";
import pagoIcon from "../assets/icons/pago.png";
import paletaIcon from "../assets/icons/paleta.png";
import subirIcon from "../assets/icons/subir.png";
import webIcon from "../assets/icons/web.png";

const adminUser = "admin";
const adminPassword = "admin123";

const initialQuotes = [
  {
    id: "COT-1777735573931",
    date: "02-05-2026",
    time: "11:26:13 a. m.",
    type: "Cotizacion",
    client: "constructora zero spa",
    contact: "claudio zurita",
    rut: "76453747-5",
    email: "info@constructorazero.net",
    phone: "977042060",
    address: "ramon subercaseaux 1268, san miguel, Metropolitana de Santiago",
    total: 0,
    sent: false,
    message: "cronometro 24 s inalambrico y tablero basquet 24x180",
  },
  {
    id: "COT-20260428-1736",
    date: "28-04-2026",
    time: "09:18:44 a. m.",
    type: "Cotizacion",
    client: "Municipalidad Los Angeles",
    contact: "Compras Municipales",
    rut: "69.170.100-K",
    email: "compras@losangeles.cl",
    phone: "432401000",
    address: "Los Angeles, Biobio",
    total: 9999998,
    sent: false,
    message: "Alfombra institucional personalizada para recepcion.",
  },
  {
    id: "COT-20260425-1750",
    date: "25-04-2026",
    time: "05:50:02 p. m.",
    type: "Cotizacion",
    client: "MARSUR CHILE",
    contact: "Area comercial",
    rut: "76.111.222-3",
    email: "ventas@marsur.cl",
    phone: "987654321",
    address: "Santiago, Metropolitana de Santiago",
    total: 904400,
    sent: false,
    message: "Logo en formato alfombra para oficina.",
  },
  {
    id: "COT-20260418-1108",
    date: "18-04-2026",
    time: "11:08:30 a. m.",
    type: "Cotizacion",
    client: "My Favorite Rug",
    contact: "Equipo tienda",
    rut: "77.777.777-7",
    email: "hola@myfavoriterug.com",
    phone: "900000000",
    address: "Santiago, Chile",
    total: 139000,
    sent: true,
    message: "Mascota personalizada.",
  },
];

const clients = [
  { name: "constructora zero spa", email: "contacto@zero.cl", quotes: "1", lastOrder: "02-05-2026" },
  { name: "Municipalidad Los Angeles", email: "compras@losangeles.cl", quotes: "1", lastOrder: "28-04-2026" },
  { name: "MARSUR CHILE", email: "ventas@marsur.cl", quotes: "1", lastOrder: "25-04-2026" },
];

const adminSections = [
  { id: "summary", label: "Resumen", icon: adminIcon },
  { id: "quotes", label: "Cotizaciones", icon: monedaIcon },
  { id: "orders", label: "Ordenes", icon: carritoIcon },
  { id: "purchase-orders", label: "Ordenes de compra", icon: compraIcon },
  { id: "payments", label: "Pagos", icon: pagoIcon },
  { id: "shipping", label: "Envios", icon: envioIcon },
  { id: "products", label: "Productos", icon: cajaIcon },
  { id: "projects", label: "Proyectos", icon: webIcon },
  { id: "categories", label: "Categorias", icon: paletaIcon },
  { id: "upload", label: "Subir productos", icon: subirIcon },
] as const;

type AdminSection = (typeof adminSections)[number]["id"];

function formatClp(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0,
  }).format(value);
}

const sectionCopy: Record<AdminSection, { title: string; description: string }> = {
  summary: { title: "Resumen", description: "Vista general de ventas, cotizaciones y actividad reciente." },
  quotes: { title: "Cotizaciones o estimados", description: "Vista tipo panel para gestionar cotizaciones y datos de clientes." },
  orders: { title: "Ordenes", description: "Revisa pedidos, estados y solicitudes de alfombras personalizadas." },
  "purchase-orders": { title: "Ordenes de compra", description: "Gestiona documentos y compras asociadas a pedidos especiales." },
  payments: { title: "Pagos", description: "Controla pagos pendientes, abonados y confirmados." },
  shipping: { title: "Envios", description: "Organiza despachos nacionales e internacionales." },
  products: { title: "Productos", description: "Crea y edita alfombras disponibles en la tienda." },
  projects: { title: "Proyectos", description: "Da seguimiento a proyectos personalizados en produccion." },
  categories: { title: "Categorias", description: "Administra categorias visibles en la tienda." },
  upload: { title: "Subir productos", description: "Carga productos temporales al catalogo." },
};

const sectionRows: Record<Exclude<AdminSection, "quotes">, Array<Record<string, string>>> = {
  summary: [
    { Indicador: "Cotizaciones", Valor: "4", Estado: "Activas" },
    { Indicador: "Pedidos", Valor: "3", Estado: "En revision" },
    { Indicador: "Ventas", Valor: formatClp(11038398), Estado: "Estimado" },
  ],
  orders: [
    { Numero: "ORD-20260502-01", Cliente: "constructora zero spa", Estado: "Pendiente" },
    { Numero: "ORD-20260428-02", Cliente: "Municipalidad Los Angeles", Estado: "En produccion" },
  ],
  "purchase-orders": [
    { Numero: "OC-1028", Proveedor: "Lanas premium", Estado: "Solicitada" },
    { Numero: "OC-1029", Proveedor: "Empaque y cajas", Estado: "Recibida" },
  ],
  payments: [
    { Cliente: "MARSUR CHILE", Total: formatClp(904400), Estado: "Pagado" },
    { Cliente: "Municipalidad Los Angeles", Total: formatClp(9999998), Estado: "Pendiente" },
  ],
  shipping: [
    { Pedido: "ORD-20260428-02", Destino: "Los Angeles, Chile", Estado: "Preparando" },
    { Pedido: "ORD-20260418-03", Destino: "Santiago, Chile", Estado: "Enviado" },
  ],
  products: [
    { Producto: "Alfombra personalizada 60x90", Precio: formatClp(45000), Estado: "Activa" },
    { Producto: "Alfombra personalizada 120x180", Precio: formatClp(139000), Estado: "Activa" },
  ],
  projects: [
    { Proyecto: "Logo corporativo", Cliente: "constructora zero spa", Estado: "Diseno" },
    { Proyecto: "Mascota tufting", Cliente: "My Favorite Rug", Estado: "Produccion" },
  ],
  categories: [
    { Categoria: "Anime", Productos: "8", Estado: "Visible" },
    { Categoria: "Logos", Productos: "12", Estado: "Visible" },
  ],
  upload: [
    { Campo: "Imagen", Requisito: "PNG, JPG o WEBP", Estado: "Pendiente" },
    { Campo: "Precio", Requisito: "CLP, USD o EUR", Estado: "Pendiente" },
  ],
};

export default function Admin() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [quotes, setQuotes] = useState(initialQuotes);
  const [activeSection, setActiveSection] = useState<AdminSection>("quotes");
  const [activeView, setActiveView] = useState<"quotes" | "clients">("quotes");
  const [selectedQuoteId, setSelectedQuoteId] = useState<string | null>(null);
  const [period, setPeriod] = useState("Todos");
  const [search, setSearch] = useState("");
  const [limit, setLimit] = useState("10");

  useEffect(() => {
    setIsLoggedIn(sessionStorage.getItem("admin-authenticated") === "true");
  }, []);

  function handleLogin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (username.trim() === adminUser && password === adminPassword) {
      sessionStorage.setItem("admin-authenticated", "true");
      setIsLoggedIn(true);
      setPassword("");
      setError("");
      return;
    }

    setError("Usuario o password incorrecto.");
  }

  function handleLogout() {
    sessionStorage.removeItem("admin-authenticated");
    setIsLoggedIn(false);
    setUsername("");
    setPassword("");
  }

  function handleDeleteQuote(id: string) {
    setQuotes((currentQuotes) => currentQuotes.filter((quote) => quote.id !== id));

    if (selectedQuoteId === id) {
      setSelectedQuoteId(null);
    }
  }

  const filteredQuotes = quotes.filter((quote) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [quote.id, quote.type, quote.client, quote.date].some((value) => value.toLowerCase().includes(query));
  });

  const filteredClients = clients.filter((client) => {
    const query = search.trim().toLowerCase();
    if (!query) return true;
    return [client.name, client.email, client.lastOrder].some((value) => value.toLowerCase().includes(query));
  });

  const currentSection = sectionCopy[activeSection];
  const showQuoteTools = activeSection === "quotes";
  const selectedQuote = quotes.find((quote) => quote.id === selectedQuoteId);

  return (
    <>
      <Navbar />

      <main className="admin-page">
        {isLoggedIn ? (
          <div className="admin-dashboard">
            <aside className="admin-sidebar" aria-label="Menu de administrador">
              <strong>Admin</strong>
              <nav>
                {adminSections.map((item) => (
                  <button
                    type="button"
                    className={activeSection === item.id ? "is-active" : ""}
                    key={item.id}
                    onClick={() => {
                      setActiveSection(item.id);
                      setSelectedQuoteId(null);
                    }}
                  >
                    <span aria-hidden="true"><img src={item.icon} alt="" /></span>
                    {item.label}
                  </button>
                ))}
              </nav>
            </aside>

            <section className="admin-workspace">
              <header className="admin-toolbar">
                <div>
                  <h1>{currentSection.title}</h1>
                  <p>{currentSection.description}</p>
                </div>

                <div className="admin-toolbar-actions">
                  {showQuoteTools && !selectedQuote && (
                    <>
                      <button type="button" className={activeView === "quotes" ? "is-active" : ""} onClick={() => setActiveView("quotes")}>
                        Cotizaciones
                      </button>
                      <button type="button" className={activeView === "clients" ? "is-active" : ""} onClick={() => setActiveView("clients")}>
                        Clientes
                      </button>
                    </>
                  )}
                  <button type="button" className="admin-add-button">
                    {activeSection === "upload" ? "+ Subir producto" : "+ Nuevo"}
                  </button>
                  <button type="button" onClick={handleLogout}>Salir</button>
                </div>
              </header>

              <section className="admin-data-panel">
                {showQuoteTools && !selectedQuote && (
                  <>
                    <div className="admin-filters">
                      <label>
                        <span>Periodo</span>
                        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
                          <option>Todos</option>
                          <option>Ultimos 7 dias</option>
                          <option>Este mes</option>
                          <option>Este anio</option>
                        </select>
                      </label>

                      <label>
                        <span>Inicio</span>
                        <input type="date" />
                      </label>

                      <label>
                        <span>Fin</span>
                        <input type="date" />
                      </label>

                      <label className="admin-search">
                        <span>Palabra clave</span>
                        <input
                          type="search"
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Cliente, email, producto, numero"
                        />
                      </label>

                      <label>
                        <span>Mostrar</span>
                        <select value={limit} onChange={(event) => setLimit(event.target.value)}>
                          <option>10</option>
                          <option>25</option>
                          <option>50</option>
                        </select>
                      </label>

                      <button type="button" className="admin-csv-button">CSV</button>
                    </div>

                    <p className="admin-result-count">
                      Mostrando {activeView === "quotes" ? filteredQuotes.length : filteredClients.length} resultado(s).
                    </p>
                  </>
                )}

                <div className="admin-table-wrap">
                  {selectedQuote ? (
                    <div className="quote-detail">
                      <header className="quote-detail-header">
                        <div>
                          <h2>Detalle de cotizacion</h2>
                          <p>{selectedQuote.id} · {selectedQuote.date}, {selectedQuote.time}</p>
                        </div>

                        <div className="quote-detail-actions">
                          <button type="button" onClick={() => setSelectedQuoteId(null)}>Cerrar</button>
                          <button type="button" className="info">CSV</button>
                          <button type="button" className="success">PDF</button>
                          <button type="button" className="danger">Eliminar</button>
                          <button type="button" className="edit">Editar</button>
                        </div>
                      </header>

                      <div className="quote-detail-grid">
                        <article>
                          <h3>Cliente</h3>
                          <p><strong>Empresa:</strong> {selectedQuote.client}</p>
                          <p><strong>Nombre:</strong> {selectedQuote.contact}</p>
                          <p><strong>RUT:</strong> {selectedQuote.rut}</p>
                          <p><strong>Email:</strong> {selectedQuote.email}</p>
                          <p><strong>Telefono:</strong> {selectedQuote.phone}</p>
                          <p><strong>Direccion:</strong> {selectedQuote.address}</p>
                        </article>

                        <article>
                          <h3>Resumen</h3>
                          <dl className="quote-summary-list">
                            <dt>Tipo</dt><dd>{selectedQuote.type}</dd>
                            <dt>Estado</dt><dd>Abierto</dd>
                            <dt>Enviado</dt><dd>{selectedQuote.sent ? "Si" : "No"}</dd>
                            <dt>Condicion de pago</dt><dd>Contado</dd>
                            <dt>Metodo de pago</dt><dd>Por definir</dd>
                            <dt>Vigencia</dt><dd>15 dias</dd>
                            <dt>Plazo entrega</dt><dd>-</dd>
                            <dt>Envio neto</dt><dd>{formatClp(0)}</dd>
                            <dt>Total</dt><dd>{formatClp(selectedQuote.total)}</dd>
                          </dl>
                        </article>
                      </div>

                      <article className="quote-detail-card">
                        <h3>Articulos</h3>
                        <table className="quote-items-table">
                          <thead>
                            <tr>
                              <th>Cant.</th>
                              <th>Descripcion</th>
                              <th>Variable</th>
                              <th>Precio uni.</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr>
                              <td colSpan={5}>Sin productos.</td>
                            </tr>
                          </tbody>
                        </table>
                      </article>

                      <div className="quote-notes-grid">
                        <article>
                          <h3>Mensaje</h3>
                          <p>{selectedQuote.message}</p>
                        </article>
                        <article>
                          <h3>Nota publica</h3>
                          <p>-</p>
                        </article>
                        <article>
                          <h3>Nota privada</h3>
                          <p>-</p>
                        </article>
                      </div>
                    </div>
                  ) : showQuoteTools && activeView === "quotes" ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Fecha</th>
                          <th>Numero</th>
                          <th>Tipo</th>
                          <th>Cliente</th>
                          <th>Total</th>
                          <th>Enviado</th>
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredQuotes.map((quote) => (
                          <tr key={quote.id}>
                            <td>{quote.date}</td>
                            <td>
                              <button
                                type="button"
                                className="quote-number-button"
                                onClick={() => setSelectedQuoteId(quote.id)}
                              >
                                {quote.id}
                              </button>
                            </td>
                            <td>{quote.type}</td>
                            <td>{quote.client}</td>
                            <td>{formatClp(quote.total)}</td>
                            <td>{quote.sent ? "Si" : "No"}</td>
                            <td>
                              <button type="button" onClick={() => setSelectedQuoteId(quote.id)}>Ver</button>
                              <button type="button" className="danger" onClick={() => handleDeleteQuote(quote.id)}>
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : showQuoteTools ? (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          <th>Cliente</th>
                          <th>Email</th>
                          <th>Cotizaciones</th>
                          <th>Ultimo pedido</th>
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredClients.map((client) => (
                          <tr key={client.email}>
                            <td>{client.name}</td>
                            <td>{client.email}</td>
                            <td>{client.quotes}</td>
                            <td>{client.lastOrder}</td>
                            <td><button type="button">Ver</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <table className="admin-table">
                      <thead>
                        <tr>
                          {Object.keys(sectionRows[activeSection][0]).map((heading) => (
                            <th key={heading}>{heading}</th>
                          ))}
                          <th>Accion</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sectionRows[activeSection].map((row, index) => (
                          <tr key={`${activeSection}-${index}`}>
                            {Object.values(row).map((value) => (
                              <td key={value}>{value}</td>
                            ))}
                            <td>
                              <button type="button">Ver</button>
                              <button type="button">Editar</button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </section>
            </section>
          </div>
        ) : (
          <section className="admin-login-shell">
            <form className="admin-login" onSubmit={handleLogin}>
              <span className="admin-kicker">ACCESO ADMIN</span>
              <h1>Iniciar sesion</h1>
              <p>Ingresa usuario y password para entrar al panel.</p>

              <label>
                <span>Usuario</span>
                <input type="text" value={username} onChange={(event) => setUsername(event.target.value)} autoComplete="username" />
              </label>

              <label>
                <span>Password</span>
                <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" />
              </label>

              {error && <strong className="admin-login-error">{error}</strong>}

              <button type="submit" className="btn btn-primary">ENTRAR</button>
            </form>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
