import Footer from "../components/Footer";
import Navbar from "../components/Navbar";

export default function Admin() {
  return (
    <>
      <Navbar />

      <main className="admin-page">
        <section className="admin-panel">
          <div>
            <span className="admin-kicker">SUPERADMIN</span>
            <h1>Panel de administrador</h1>
            <p>Gestiona productos, pedidos y contenido de la tienda.</p>
          </div>

          <div className="admin-actions">
            <button type="button">Nuevo producto</button>
            <button type="button">Ver pedidos</button>
          </div>
        </section>

        <section className="admin-grid">
          <article>
            <strong>Productos</strong>
            <span>Crear y editar alfombras disponibles.</span>
          </article>
          <article>
            <strong>Pedidos</strong>
            <span>Revisar ventas, estados y datos de envio.</span>
          </article>
          <article>
            <strong>Contenido</strong>
            <span>Actualizar textos, categorias y promociones.</span>
          </article>
        </section>
      </main>

      <Footer />
    </>
  );
}
