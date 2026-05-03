import banner from "../assets/banner.png";

const categories = [
  { title: "DISE\u00d1OS POPULARES", pos: "74% 48%" },
  { title: "SNEAKERS", pos: "69% 31%" },
  { title: "ANIME", pos: "78% 43%" },
  { title: "MARCAS Y LOGOS", pos: "62% 51%" },
  { title: "MASCOTAS", pos: "86% 40%" },
];

export default function Categories() {
  return (
    <section className="categories-section">
      <div className="section-heading">
        <h2>EXPLORA NUESTRAS CATEGORIAS</h2>
        <a href="/tienda">VER TODAS <span aria-hidden="true">&rarr;</span></a>
      </div>

      <div className="category-grid">
        {categories.map((category) => (
          <article className="category-card" key={category.title}>
            <div
              className="category-image"
              style={{ backgroundImage: `url(${banner})`, backgroundPosition: category.pos }}
            />
            <h3>{category.title}</h3>
            <a href="/tienda">VER MAS <span aria-hidden="true">&rarr;</span></a>
          </article>
        ))}
      </div>

      <div className="promo-grid">
        <article className="why-card">
          <h3>&iquest;POR QUE ELEGIRNOS?</h3>
          <ul>
            <li>Materiales de alta calidad</li>
            <li>Colores vibrantes y duraderos</li>
            <li>Dise&ntilde;os 100% personalizados</li>
            <li>Atencion personalizada</li>
            <li>Miles de clientes satisfechos</li>
          </ul>
        </article>

        <article className="review-card">
          <div className="review-avatar">MG</div>
          <div>
            <strong>★★★★★</strong>
            <p>"Mi alfombra quedo mejor de lo que imagine, la calidad esta increible."</p>
            <span>- Mariana G.</span>
          </div>
        </article>

        <article className="community-card">
          <div>
            <h3>UNETE A LA COMUNIDAD</h3>
            <p>Siguenos en Instagram y descubre nuevos dise&ntilde;os cada semana.</p>
            <strong>@myfavoriterug</strong>
          </div>
          <span className="good-vibes">GOOD<br />VIBES</span>
        </article>
      </div>
    </section>
  );
}
