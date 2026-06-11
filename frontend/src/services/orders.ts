import type { CartItem } from "./cart";
import { getAccountToken } from "./accountAuth";
import { API } from "./http";

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
  order?: Order;
  createdAt?: string;
  paidAt?: string;
};

export type OrderConfirmation = {
  orderId: number;
  orderNumber: string;
  total: number;
  orderStatus: string;
  paymentStatus?: string | null;
  paymentMethod: string;
  shippingMethod: string;
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

export function saveOrder(order: Order) {
  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify([order, ...getOrders()]));
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  return order;
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
  const token = getAccountToken();
  const response = await API.post<Order>("/orders", {
    ...order,
    items: toBackendItems(order.items),
  }, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
  return response.data;
}

export async function getBackendOrders() {
  const response = await API.get<Order[]>("/orders");
  return response.data;
}

export async function getAccountOrders() {
  const token = getAccountToken();

  if (!token) return [];

  const response = await API.get<Order[]>("/orders/mine", {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
}

export async function createPaymentIntent(orderId: Order["id"], provider: string) {
  const response = await API.post<Payment>("/payments/intent", {
    orderId,
    provider,
  });

  return response.data;
}

export async function getOrderConfirmation(orderId: Order["id"]) {
  const response = await API.get<OrderConfirmation>(`/payments/order/${orderId}/confirmation`);
  return response.data;
}

export async function getPayments() {
  const response = await API.get<Payment[]>("/payments");
  return response.data;
}

export async function deletePayment(paymentId: Payment["id"]) {
  await API.delete(`/payments/${paymentId}`);
}

export async function confirmPayment(paymentId: Payment["id"]) {
  const response = await API.patch<Payment>(`/payments/${paymentId}/confirm`);
  return response.data;
}

export async function failPayment(paymentId: Payment["id"]) {
  const response = await API.patch<Payment>(`/payments/${paymentId}/fail`);
  return response.data;
}

export async function updateOrderShipping(id: string, shipping: Pick<Order, "trackingNumber" | "shippingStatus">) {
  const numericId = Number(id);

  if (Number.isFinite(numericId)) {
    const response = await API.patch<Order>(`/orders/${numericId}/shipping`, shipping);
    window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
    return response.data;
  }

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

export async function deleteBackendOrder(id: Order["id"]) {
  const numericId = Number(id);
  await API.delete(`/orders/${numericId}`);
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
}

export function deleteOrder(id: Order["id"]) {
  const nextOrders = getOrders().filter((order) => String(order.id) !== String(id));

  window.localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(nextOrders));
  window.dispatchEvent(new Event(ORDERS_UPDATED_EVENT));
}
