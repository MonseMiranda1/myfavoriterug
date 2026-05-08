import axios from "axios";
import { localProducts } from "../data/products";

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

const UPLOADED_PRODUCTS_KEY = "my-favorite-rug-uploaded-products";
const DELETED_PRODUCTS_KEY = "my-favorite-rug-deleted-products";
const CATEGORIES_KEY = "my-favorite-rug-categories";
const PRODUCT_IMAGE_PREFIX = "mfr-image:";
const PRODUCT_IMAGE_DB = "my-favorite-rug-images";
const PRODUCT_IMAGE_STORE = "images";
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

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

function canUseIndexedDb() {
  return typeof window !== "undefined" && Boolean(window.indexedDB);
}

function openProductImageDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    if (!canUseIndexedDb()) {
      reject(new Error("IndexedDB no disponible."));
      return;
    }

    const request = window.indexedDB.open(PRODUCT_IMAGE_DB, 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore(PRODUCT_IMAGE_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function saveProductImage(dataUrl: string) {
  const key = `${PRODUCT_IMAGE_PREFIX}${Date.now()}-${crypto.randomUUID?.() ?? Math.random().toString(36).slice(2)}`;
  const db = await openProductImageDb();

  await new Promise<void>((resolve, reject) => {
    const transaction = db.transaction(PRODUCT_IMAGE_STORE, "readwrite");
    transaction.objectStore(PRODUCT_IMAGE_STORE).put(dataUrl, key);
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error);
  });

  db.close();
  return key;
}

async function getProductImage(key: string) {
  if (!key.startsWith(PRODUCT_IMAGE_PREFIX)) return key;

  const db = await openProductImageDb();
  const dataUrl = await new Promise<string | undefined>((resolve, reject) => {
    const transaction = db.transaction(PRODUCT_IMAGE_STORE, "readonly");
    const request = transaction.objectStore(PRODUCT_IMAGE_STORE).get(key);

    request.onsuccess = () => resolve(typeof request.result === "string" ? request.result : undefined);
    request.onerror = () => reject(request.error);
  });

  db.close();
  return dataUrl ?? "";
}

async function saveProductImageList(images: string[]) {
  if (!canUseIndexedDb()) return images;

  return Promise.all(images.map((image) => (image.startsWith(PRODUCT_IMAGE_PREFIX) ? image : saveProductImage(image))));
}

async function resolveProductImages(product: Product) {
  const images = product.images && product.images.length > 0 ? product.images : [product.image];
  const resolvedImages = await Promise.all(images.map(getProductImage));
  const cleanImages = resolvedImages.filter(Boolean);

  return {
    ...product,
    image: cleanImages[0] ?? product.image,
    images: cleanImages.length > 0 ? cleanImages : product.images,
  };
}

export function getUploadedProducts(): Product[] {
  if (!canUseStorage()) return [];

  const rawProducts = window.localStorage.getItem(UPLOADED_PRODUCTS_KEY);
  if (!rawProducts) return [];

  try {
    const parsed = JSON.parse(rawProducts);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveUploadedProducts(products: Product[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(UPLOADED_PRODUCTS_KEY, JSON.stringify(products));
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
}

function getDeletedProductIds() {
  if (!canUseStorage()) return [];

  const rawIds = window.localStorage.getItem(DELETED_PRODUCTS_KEY);
  if (!rawIds) return [];

  try {
    const parsed = JSON.parse(rawIds);
    return Array.isArray(parsed) ? parsed.map(String) : [];
  } catch {
    return [];
  }
}

function saveDeletedProductIds(ids: string[]) {
  if (!canUseStorage()) return;

  window.localStorage.setItem(DELETED_PRODUCTS_KEY, JSON.stringify(ids));
  window.dispatchEvent(new Event(PRODUCTS_UPDATED_EVENT));
}

export async function saveUploadedProduct(product: ProductInput) {
  const uploadedProducts = getUploadedProducts();
  const images = await saveProductImageList(product.images && product.images.length > 0 ? product.images : [product.image]);
  const newProduct: Product = {
    ...product,
    image: images[0],
    images,
    id: `local-${Date.now()}`,
  };

  saveUploadedProducts([newProduct, ...uploadedProducts]);
  return resolveProductImages(newProduct);
}

export async function updateUploadedProduct(id: Product["id"], product: ProductInput) {
  const uploadedProducts = getUploadedProducts();
  const images = await saveProductImageList(product.images && product.images.length > 0 ? product.images : [product.image]);
  const nextProduct = {
    ...product,
    image: images[0],
    images,
    id,
  };
  const exists = uploadedProducts.some((currentProduct) => String(currentProduct.id) === String(id));
  const nextProducts = exists
    ? uploadedProducts.map((currentProduct) => (String(currentProduct.id) === String(id) ? nextProduct : currentProduct))
    : [nextProduct, ...uploadedProducts];
  const deletedIds = getDeletedProductIds().filter((deletedId) => deletedId !== String(id));

  saveUploadedProducts(nextProducts);
  saveDeletedProductIds(deletedIds);
  return resolveProductImages(nextProduct);
}

export function deleteUploadedProduct(id: Product["id"]) {
  saveUploadedProducts(getUploadedProducts().filter((product) => String(product.id) !== String(id)));
  saveDeletedProductIds([...new Set([...getDeletedProductIds(), String(id)])]);
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

async function mergeProducts(products: Product[]) {
  const uploadedProducts = getUploadedProducts();
  const uploadedIds = new Set(uploadedProducts.map((product) => String(product.id)));
  const deletedIds = new Set(getDeletedProductIds());

  const mergedProducts = [...uploadedProducts, ...products.filter((product) => !uploadedIds.has(String(product.id)))]
    .filter((product) => !deletedIds.has(String(product.id)));

  return Promise.all(mergedProducts.map(resolveProductImages));
}

export const getProducts = () =>
  API.get<Product[]>("/products")
    .then(async (response) => ({ data: await mergeProducts(response.data) }))
    .catch(async () => Promise.resolve({ data: await mergeProducts(localProducts) }));
