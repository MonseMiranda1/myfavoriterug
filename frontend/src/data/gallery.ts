import banner from "../assets/banner.png";
import monse from "../assets/monse.jpg";
import dog from "../assets/tienda/animales/IMG_5792.jpg"

export type GalleryCategory = "Customer Photos" | "Behind The Scenes" | "Video Process" | "Finished Rugs";

export type GalleryItem = {
  id: number;
  title: string;
  titleEn: string;
  category: GalleryCategory;
  image: string;
  videoUrl?: string;
  type: "image" | "instagram" | "youtube"; 
  description: string;
  descriptionEn: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Pieza personalizada para living",
    titleEn: "Living room custom piece",
    category: "Customer Photos",
    type: "instagram",
    image: banner,
    videoUrl: "https://www.instagram.com/reel/DVJRHmqDaYZ/", 
    description: "Alfombra personalizada instalada en casa de cliente.",
    descriptionEn: "Custom rug installed in a customer's home.",
  },
  {
    id: 2,
    title: "Selección de colores",
    titleEn: "Color matching",
    category: "Behind The Scenes",
    type: "image",
    image: monse,
    description: "Selección de tonos antes de comenzar el tufting.",
    descriptionEn: "Color selection before starting the tufting process.",
  },
  {
    id: 3,
    title: "Proceso de tufting",
    titleEn: "Tufting process",
    category: "Video Process",
    type: "youtube", 
    image: "https://img.youtube.com/vi/DP_FPgb1eiU/hqdefault.jpg", 
    videoUrl: "https://youtube.com/embed/nKuNVKWPoK4", 
    description: "Proceso de confección desde la tela base.",
    descriptionEn: "Production process starting from the base fabric.",
  },
  {
    id: 4,
    title: "Alfombra de logo terminada",
    titleEn: "Finished logo rug",
    category: "Finished Rugs",
    type: "instagram",
    image: dog,
    videoUrl: "https://www.instagram.com/reel/DWB1t3lDeuK/", 
    description: "Pieza terminada, perfilada y lista para despacho.",
    descriptionEn: "Finished, trimmed piece ready for shipping.",
  },
  {
    id: 5,
    title: "Proceso alfombra de perro",
    titleEn: "Dog rug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/Gypw-iQyxys/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/Gypw-iQyxys",
    description: "Proceso de confección de alfombra de perro.",
    descriptionEn: "Production process for dog rug."
  },
 {id: 6,
    title: "Proceso alfombra Trippy Felix the cat",
    titleEn: "Felix the cat trippy rug process", 
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/GfNKXakfJLc/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/GfNKXakfJLc",
    description: "Proceso de confección de alfombra trippy",
    descriptionEn: "Production process for trippy rug."
  }
  {id: 7
    title: "Proceso alfombra de Stich",
    titleEn: "Stich rug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/QRkQu6h3zX4/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/QRkQu6h3zX4",
    description: "Proceso de confección de alfombra de Stich.",
    descriptionEn: "Production process for Stich rug."
  }
  {id: 8
    title: "Proceso alfombra Gato realismo",
    titleEn: "Realistic cat rug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/DFQAfCY3Nnk/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/DFQAfCY3Nnk",
    description: "Proceso de confección de alfombra de Gato realismo.",
    descriptionEn: "Production process for realistic cat rug."
  }
  {id: 9
    title: "Proceso alfombra Pikachu",
    titleEn: "Realistic Pikachu rug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/qDdoUZqYwQI/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/qDdoUZqYwQI",
    description: "Proceso de confección de alfombra de Pikachu.",
    descriptionEn: "Production process for realistic Pikachu rug."
  }
  {id: 10
    title: "Proceso alfombra de Perro salchicha",
    titleEn: "Sausage dog rug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/xhw8tjAFVEA/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/xhw8tjAFVEA",
    description: "Proceso de confección de alfombra de perro salchicha.",
    descriptionEn: "Production process for sausage dog rug."
  }
  {id: 11
    title: "Proceso alfombra Luffy",
    titleEn: "Luffyrug process",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/c94HNKRVMHQ/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/c94HNKRVMHQ",
    description: "Proceso de confección de alfombra de Luffy.",
    descriptionEn: "Production process for Luffy rug."
  }
  {id: 12
    title: "Proceso alfombra Nezuko",
    titleEn: "Nezuko rug process 2",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/pOzURHe2tIU/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/pOzURHe2tIU",
    description: "Proceso de confección de alfombra de Nezuko.",
    descriptionEn: "Production process for Nezuko rug."
  }
  {id: 13
    title: "Proceso alfombra de WuTang",
    titleEn: "WuTang rug process 2",
    category: "Video Process",
    type: "youtube",
    image: "https://img.youtube.com/vi/SgO2OuMedmw/hqdefault.jpg",
    videoUrl: "https://youtube.com/embed/SgO2OuMedmw",
    description: "Proceso de confección de alfombra de WuTang.",
    descriptionEn: "Production process for WuTang rug."
  }
]