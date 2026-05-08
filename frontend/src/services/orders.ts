import type { CartItem } from "./cart";

export type Order = {
  id: string;
  customerName: string;
  email: string;
  address: string;
  shippingMethod: string;
  paymentMethod: string;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: string;
};

const ORDERS_STORAGE_KEY = "my-favorite-rug-orders";

export function getOrders(): Order[] {
  const raw = window.localStorage.getItem(ORDERS_STORAGE_KEY);

  if (!raw) return [];

  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveOrder(order: Omit<Order, "id" | "createdAt" | "status">) {
  const nextOrder: Order = {
    ...order,
    id: `MFR-${Date.now().toString().slice(-6)}`,
    createdAt: new Date().toISOString(),
    status: "Confirmado",
  };

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([nextOrder, ...getOrders()]));
  return nextOrder;
}
