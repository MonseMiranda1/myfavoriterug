import banner from "../assets/banner.png";
import monse from "../assets/monse.jpg";
import pikachuImg1 from "../assets/tienda/anime/IMG_6298.jpg";
import pikachuImg2 from "../assets/tienda/anime/IMG_6301.jpg";
import type { Product } from "../services/api";

export const localProducts: Product[] = [
  {
    id: 101,
    name: "Custom Logo Rug",
    price: 89000,
    image: banner,
    images: [banner],
    category: "Custom Rugs",
    collection: "Custom Rugs",
    bestSeller: true,
    newArrival: false,
  },
  {
    id: 102,
    name: "Anime Hero Rug",
    price: 99000,
    image: pikachuImg1,
    images: [pikachuImg1, pikachuImg2],
    size: "100 x 150 cm",
    availability: "Disponible",
    category: "Anime Collection",
    collection: "Anime Collection",
    bestSeller: true,
    newArrival: true,
  },
  {
    id: 103,
    name: "Gaming Controller Rug",
    price: 76000,
    image: banner,
    images: [banner],
    category: "Gaming Collection",
    collection: "Gaming Collection",
    bestSeller: false,
    newArrival: true,
  },
  {
    id: 104,
    name: "Kawaii Heart Rug",
    price: 69000,
    image: monse,
    images: [monse],
    category: "Kawaii Collection",
    collection: "Kawaii Collection",
    bestSeller: false,
    newArrival: false,
  },
  {
    id: 105,
    name: "Minimal Cloud Rug",
    price: 59000,
    image: banner,
    images: [banner],
    category: "Minimal Collection",
    collection: "Minimal Collection",
    bestSeller: false,
    newArrival: false,
  },
];
