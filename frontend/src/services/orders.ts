import axios from "axios";
import type { CartItem } from "./cart";

export type Order = {
  id: string | number;
  orderNumber?: string;
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

export type Payment = {
  id: number;
  provider: string;
  amount: number;
  currency: string;
  status: string;
  redirectUrl?: string;
};

const ORDERS_STORAGE_KEY = "my-favorite-rug-orders";
export const ORDERS_UPDATED_EVENT = "my-favorite-rug-orders-updated";

const API = axios.create({
  baseURL: "http://localhost:8080/api",
});

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

function toBackendItems(items: CartItem[]) {
  return items.map((item) => ({
    productId: String(item.id),
    name: item.name,
    price: item.price,
    quantity: item.quantity,
    image: item.image,
    size: item.size,
  }));
}

export async function createOrder(order: Omit<Order, "id" | "createdAt" | "status">) {
  const response = await API.post<Order>("/orders", {
    ...order,
    items: toBackendItems(order.items),
  });

  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  return response.data;
}

export async function createPaymentIntent(orderId: Order["id"], provider: string) {
  const response = await API.post<Payment>("/payments/intent", {
    orderId,
    provider,
  });

  return response.data;
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

export function deleteOrder(id: Order["id"]) {
  const nextOrders = getOrders().filter((order) => String(order.id) !== String(id));

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
}
