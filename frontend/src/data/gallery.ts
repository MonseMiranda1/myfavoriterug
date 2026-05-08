import banner from "../assets/banner.png";
import monse from "../assets/monse.jpg";

export type GalleryCategory = "Customer Photos" | "Behind The Scenes" | "Video Process" | "Finished Rugs";

export type GalleryItem = {
  id: number;
  title: string;
  titleEn: string;
  category: GalleryCategory;
  image: string;
  description: string;
  descriptionEn: string;
};

export const galleryItems: GalleryItem[] = [
  {
    id: 1,
    title: "Living room custom piece",
    titleEn: "Living room custom piece",
    category: "Customer Photos",
    image: banner,
    description: "Alfombra personalizada instalada en casa de cliente.",
    descriptionEn: "Custom rug installed in a customer's home.",
  },
  {
    id: 2,
    title: "Color matching",
    titleEn: "Color matching",
    category: "Behind The Scenes",
    image: monse,
    description: "Seleccion de tonos antes de comenzar el tufting.",
    descriptionEn: "Color selection before starting the tufting process.",
  },
  {
    id: 3,
    title: "Tufting process",
    titleEn: "Tufting process",
    category: "Video Process",
    image: banner,
    description: "Proceso de confeccion desde la tela base.",
    descriptionEn: "Production process starting from the base fabric.",
  },
  {
    id: 4,
    title: "Finished logo rug",
    titleEn: "Finished logo rug",
    category: "Finished Rugs",
    image: monse,
    description: "Pieza terminada, perfilada y lista para despacho.",
    descriptionEn: "Finished, trimmed piece ready for shipping.",
  },
];
