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
  trackingNumber?: string;
  shippingStatus?: string;
};

const ORDERS_STORAGE_KEY = "my-favorite-rug-orders";
export const ORDERS_UPDATED_EVENT = "my-favorite-rug-orders-updated";

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
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  return nextOrder;
}

export function updateOrderShipping(id: string, shipping: Pick<Order, "trackingNumber" | "shippingStatus">) {
  const orders = getOrders();
  const nextOrders = orders.map((order) =>
    order.id === id
      ? {
          ...order,
          trackingNumber: shipping.trackingNumber,
          shippingStatus: shipping.shippingStatus,
          status: shipping.shippingStatus || order.status,
        }
      : order,
  );

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  return nextOrders.find((order) => order.id === id) ?? null;
}
