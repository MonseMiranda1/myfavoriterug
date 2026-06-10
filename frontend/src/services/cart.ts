import type { Product } from "./api";

export type CartItem = Product & {
  quantity: number;
  includesTax: true;
};

export const CART_STORAGE_KEY = "my-favorite-rug-cart";
export const CART_UPDATED_EVENT = "my-favorite-rug-cart-updated";
export const TAX_RATE = 0.19;

export function getPriceWithTax(price: number) {
  return Math.round(price * (1 + TAX_RATE));
}

function notifyCartUpdated() {
  window.dispatchEvent(new Event(CART_UPDATED_EVENT));
}

export function getCartItems(): CartItem[] {
  const rawCart = window.localStorage.getItem(CART_STORAGE_KEY);

  if (!rawCart) return [];

  try {
    const parsed = JSON.parse(rawCart) as Array<
      Omit<CartItem, "includesTax"> & { includesTax?: boolean }
    >;

    if (!Array.isArray(parsed)) return [];

    const items = parsed.map((item) =>
      item.includesTax
        ? ({ ...item, includesTax: true } as CartItem)
        : ({
            ...item,
            price: getPriceWithTax(item.price),
            includesTax: true,
          } as CartItem),
    );

    if (parsed.some((item) => !item.includesTax)) {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    }

    return items;
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

  saveCartItems([
    ...items,
    {
      ...product,
      price: getPriceWithTax(product.price),
      quantity: 1,
      includesTax: true,
    },
  ]);
}

export function getCartQuantity() {
  return getCartItems().reduce((total, item) => total + item.quantity, 0);
}
