import { API, getApiErrorMessage } from "./http";

export type PurchaseOrder = {
  id: number;
  purchaseOrderNumber: string;
  client: string;
  provider: string;
  status: string;
  total: number;
  relatedOrderNumber?: string;
  notes?: string;
  createdAt: string;
};

export type PurchaseOrderInput = {
  client: string;
  provider: string;
  status: string;
  total: number;
  relatedOrderNumber: string;
  notes: string;
};

export async function getPurchaseOrders() {
  try {
    const response = await API.get<PurchaseOrder[]>("/purchase-orders");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las ordenes de compra."), { cause: error });
  }
}

export async function createPurchaseOrder(input: PurchaseOrderInput) {
  try {
    const response = await API.post<PurchaseOrder>("/purchase-orders", input);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo crear la orden de compra."), { cause: error });
  }
}

export async function updatePurchaseOrder(id: PurchaseOrder["id"], input: PurchaseOrderInput) {
  try {
    const response = await API.patch<PurchaseOrder>(`/purchase-orders/${id}`, input);
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo actualizar la orden de compra."), { cause: error });
  }
}

export async function deletePurchaseOrder(id: PurchaseOrder["id"]) {
  try {
    await API.delete(`/purchase-orders/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo eliminar la orden de compra."), { cause: error });
  }
}
