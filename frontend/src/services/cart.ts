import type { Product } from "./api";

export type CartItem = Product & {
  quantity: number;
};

export const CART_STORAGE_KEY = "my-favorite-rug-cart";
export const CART_UPDATED_EVENT = "my-favorite-rug-cart-updated";

function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItems(): CartItem[] {
  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) return [];

  try {
    const parsed = JSON.parse(rawCart);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartItems(items: CartItem[]) {
  window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
  notifyCartUpdated();
}

export function addCartItem(product: Product) {
  const items = getCartItems();
  const existingItem = items.find((item) => String(item.id) === String(product.id));

  if (existingItem) {
    existingItem.quantity += 1;
    saveCartItems(items);
    return;
  }

  saveCartItems([...items, { ...product, quantity: 1 }]);
}

export function getCartQuantity() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
