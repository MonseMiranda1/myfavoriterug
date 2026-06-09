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
];