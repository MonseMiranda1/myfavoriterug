
import dog from "../assets/tienda/animales/IMG_8455.jpg";
import dog2 from "../assets/tienda/animales/IMG_0153.jpg";
import stich from "../assets/tienda/disney/IMG_2064.jpg";
import nezuko from "../assets/tienda/anime/IMG_7503.jpg";
import pikachu from "../assets/tienda/pokemon/IMG_8417.jpg";
import luffy from "../assets/tienda/anime/IMG_7414.jpg";
import gato from "../assets/tienda/animales/IMG_6235.jpg";
import perroSalchicha from "../assets/tienda/animales/IMG_6143.jpg";

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
    id: 2,
    title: "Proceso alfombra de perro",
    titleEn: "Dog rug process",
    category: "Video Process",
    type: "youtube",
    image: dog2,
    videoUrl: "https://youtube.com/embed/Gypw-iQyxys",
    description: "Proceso de confección de alfombra de perro.",
    descriptionEn: "Production process for dog rug."
  },
  { 
    id: 3,
    title: "Proceso alfombra de Stich",
    titleEn: "Stich rug process",
    category: "Video Process",
    type: "youtube",
    image: stich,
    videoUrl: "https://youtube.com/embed/QRkQu6h3zX4",
    description: "Proceso de confección de alfombra de Stich.",
    descriptionEn: "Production process for Stich rug."
  },
  {
    id: 4,
    title: "Proceso alfombra Gato realismo",
    titleEn: "Realistic cat rug process",
    category: "Video Process",
    type: "youtube",
    image: gato,
    videoUrl: "https://youtube.com/embed/DFQAfCY3Nnk",
    description: "Proceso de confección de alfombra de Gato realismo.",
    descriptionEn: "Production process for realistic cat rug."
  },
  {
    id: 5,
    title: "Proceso alfombra Pikachu",
    titleEn: "Realistic Pikachu rug process",
    category: "Video Process",
    type: "youtube",
    image: pikachu,
    videoUrl: "https://youtube.com/embed/qDdoUZqYwQI",
    description: "Proceso de confección de alfombra de Pikachu.",
    descriptionEn: "Production process for realistic Pikachu rug."
  },
  {
    id: 6,
    title: "Proceso alfombra de Perro salchicha",
    titleEn: "Sausage dog rug process",
    category: "Video Process",
    type: "youtube",
    image: perroSalchicha,
    videoUrl: "https://youtube.com/embed/xhw8tjAFVEA",
    description: "Proceso de confección de alfombra de perro salchicha.",
    descriptionEn: "Production process for sausage dog rug."
  },
  {
    id: 7,
    title: "Proceso alfombra Luffy",
    titleEn: "Luffyrug process",
    category: "Video Process",
    type: "youtube",
    image: luffy,
    videoUrl: "https://youtube.com/embed/c94HNKRVMHQ",
    description: "Proceso de confección de alfombra de Luffy.",
    descriptionEn: "Production process for Luffy rug."
  },
  {
    id: 8,
    title: "Proceso alfombra Nezuko",
    titleEn: "Nezuko rug process 2",
    category: "Video Process",
    type: "youtube",
    image: nezuko,
    videoUrl: "https://youtube.com/embed/pOzURHe2tIU",
    description: "Proceso de confección de alfombra de Nezuko.",
    descriptionEn: "Production process for Nezuko rug."
  },
  
]