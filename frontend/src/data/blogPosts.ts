export type BlogPost = {
  slug: string;
  title: string;
  titleEn: string;
  category: string;
  categoryEn: string;
  excerpt: string;
  excerptEn: string;
  content: string[];
  contentEn: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: "cuidado-alfombras",
    title: "Como cuidar una alfombra tufted",
    titleEn: "How to care for a tufted rug",
    category: "Rug Care Tips",
    categoryEn: "Rug Care Tips",
    excerpt: "Guia rapida para limpiar, guardar y proteger tu alfombra personalizada.",
    excerptEn: "A quick guide to clean, store, and protect your custom rug.",
    content: [
      "Aspira con baja potencia y evita cepillos duros. Para manchas pequenas, usa un pano humedo con jabon neutro.",
      "No sumerjas la alfombra en agua. Si necesita limpieza profunda, pide lavado profesional en seco.",
    ],
    contentEn: [
      "Vacuum on low power and avoid hard brushes. For small stains, use a damp cloth with neutral soap.",
      "Do not soak the rug in water. If it needs deep cleaning, request professional dry cleaning.",
    ],
  },
  {
    slug: "decoracion",
    title: "Ideas para decorar con rugs personalizados",
    titleEn: "Ideas for decorating with custom rugs",
    category: "Decoracion",
    categoryEn: "Decor",
    excerpt: "Formas simples de usar una pieza personalizada como foco visual de una habitacion.",
    excerptEn: "Simple ways to use a custom piece as the visual focus of a room.",
    content: [
      "Elige colores que conversen con muebles, cuadros o detalles pequenos del espacio.",
      "En piezas con logo o personaje, deja margen visual alrededor para que el diseno respire.",
    ],
    contentEn: [
      "Choose colors that connect with furniture, wall art, or small details in the space.",
      "For logo or character pieces, leave visual space around the rug so the design can breathe.",
    ],
  },
  {
    slug: "tendencias",
    title: "Tendencias en alfombras personalizadas",
    titleEn: "Custom rug trends",
    category: "Tendencias",
    categoryEn: "Trends",
    excerpt: "Colecciones anime, gaming, kawaii y minimal para pedidos actuales.",
    excerptEn: "Anime, gaming, kawaii, and minimal collections for current orders.",
    content: [
      "Las piezas con formas organicas y bordes suaves siguen creciendo porque funcionan bien en muro y piso.",
      "Los disenos minimalistas con una paleta corta son ideales cuando buscas algo discreto pero unico.",
    ],
    contentEn: [
      "Pieces with organic shapes and soft edges keep growing because they work well on walls and floors.",
      "Minimal designs with a short palette are ideal when you want something subtle but unique.",
    ],
  },
  {
    slug: "tutoriales",
    title: "Como preparar tu archivo para cotizar",
    titleEn: "How to prepare your file for a quote",
    category: "Tutoriales",
    categoryEn: "Tutorials",
    excerpt: "Que imagen subir y que detalles enviar para una cotizacion mas precisa.",
    excerptEn: "What image to upload and what details to send for a more accurate quote.",
    content: [
      "Sube una imagen nitida, idealmente frontal y sin sombras fuertes. Si tienes colores exactos, agregalos en comentarios.",
      "Indica medida aproximada, uso esperado y si quieres forma rectangular, circular o contorno personalizado.",
    ],
    contentEn: [
      "Upload a clear image, ideally front-facing and without strong shadows. If you have exact colors, add them in the comments.",
      "Include approximate size, expected use, and whether you want a rectangular, circular, or custom outline shape.",
    ],
  },
];
