import { localProducts } from "../data/products";
import { API } from "./http";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  images?: string[];
  size?: string;
  availability?: string;
  category?: string;
  collection?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
};

export type ProductInput = Omit<Product, "id">;

export type Category = {
  id: string;
  name: string;
  status: "Visible" | "Oculta";
};

const CATEGORIES_KEY = "my-favorite-rug-categories";
export const PRODUCTS_UPDATED_EVENT = "my-favorite-rug-products-updated";
export const CATEGORIES_UPDATED_EVENT = "my-favorite-rug-categories-updated";

const defaultCategories: Category[] = [
  { id: "custom-rugs", name: "Custom Rugs", status: "Visible" },
  { id: "anime-collection", name: "Anime Collection", status: "Visible" },
  { id: "gaming-collection", name: "Gaming Collection", status: "Visible" },
  { id: "kawaii-collection", name: "Kawaii Collection", status: "Visible" },
  { id: "minimal-collection", name: "Minimal Collection", status: "Visible" },
  { id: "animales", name: "Animales", status: "Visible" },
  { id: "disney", name: "Disney", status: "Visible" },
];

const localImageHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function getApiOrigin() {
  try {
    return new URL(API.defaults.baseURL ?? "", window.location.origin).origin;
  } catch {
    return "";
  }
}

function isLocalPage() {
  if (typeof window === "undefined") return false;

  return localImageHosts.has(window.location.hostname);
}

function resolveProductImageUrl(image: string) {
  const trimmedImage = image.trim();
  const apiOrigin = getApiOrigin();

  if (!trimmedImage || !apiOrigin) return trimmedImage;

  if (trimmedImage.startsWith("/uploads/product-images/")) {
    return apiOrigin + trimmedImage;
  }

  try {
    const imageUrl = new URL(trimmedImage);

    if (!isLocalPage() && localImageHosts.has(imageUrl.hostname)) {
      return apiOrigin + imageUrl.pathname + imageUrl.search + imageUrl.hash;
    }
  } catch {
    return trimmedImage;
  }

  return trimmedImage;
}

function normalizeProductImages(product: Product): Product {
  const images = product.images?.map(resolveProductImageUrl).filter(Boolean);
  const image = resolveProductImageUrl(product.image);

  return {
    ...product,
    image,
    images: images && images.length > 0 ? images : [image],
  };
}

export async function saveUploadedProduct(product: ProductInput) {
  const response = await API.post<Product>("/products", product);
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
  return normalizeProductImages(response.data);
}

export async function updateUploadedProduct(id: Product["id"], product: ProductInput) {
  const response = await API.put<Product>(`/products/${id}`, product);
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
  return normalizeProductImages(response.data);
}

export async function deleteUploadedProduct(id: Product["id"]) {
  await API.delete(`/products/${id}`);
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
}

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("image", file);

  const response = await API.post<{ url: string }>("/products/images", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resolveProductImageUrl(response.data.url);
}

function createCategoryId(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "") || `category-${Date.now()}`;
}

export function getCategories(): Category[] {
  if (!canUseStorage()) return defaultCategories;

  const rawCategories = window.localStorage.getItem(CATEGORIES_KEY);
  if (!rawCategories) return defaultCategories;

  try {
    const parsed = JSON.parse(rawCategories);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : defaultCategories;
  } catch {
    return defaultCategories;
  }
}

function saveCategories(categories: Category[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(CATEGORIES_KEY, JSON.stringify(categories));
  window.dispatchEvent(new Event(CATEGORIES_UPDATED_EVENT));
}

export function saveCategory(input: Omit<Category, "id">) {
  const categories = getCategories();
  const newCategory: Category = {
    ...input,
    id: `${createCategoryId(input.name)}-${Date.now()}`,
  };

  saveCategories([...categories, newCategory]);
  return newCategory;
}

export function updateCategory(id: string, input: Omit<Category, "id">) {
  const categories = getCategories();
  const nextCategories = categories.map((category) => (category.id === id ? { ...category, ...input } : category));

  saveCategories(nextCategories);
  return nextCategories.find((category) => category.id === id) ?? null;
}

export function deleteCategory(id: string) {
  saveCategories(getCategories().filter((category) => category.id !== id));
}

export const getProducts = () =>
  API.get<Product[]>("/products")
    .then((response) => ({ ...response, data: response.data.map(normalizeProductImages) }))
    .catch(() => Promise.resolve({ data: localProducts.map(normalizeProductImages) }));
