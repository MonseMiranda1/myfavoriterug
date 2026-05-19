import { getAccountToken } from "./accountAuth";
import { API, getApiErrorMessage } from "./http";

export type CustomQuoteRequest = {
  id: number;
  quoteNumber: string;
  createdAt: string;
  customerName: string;
  email: string;
  phone: string;
  rut: string;
  address: string;
  imageName: string;
  size: string;
  wool: string;
  colors: string;
  currency: string;
  comments: string;
  totalClp: number;
  status: string;
  sent: boolean;
};

export type CreateQuoteInput = {
  customerName?: string;
  email?: string;
  phone?: string;
  rut?: string;
  address?: string;
  imageName: string;
  size: string;
  wool: string;
  colors: string;
  currency: string;
  comments: string;
  totalClp: number;
};

function authHeaders() {
  const token = getAccountToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export async function getQuoteRequests(): Promise<CustomQuoteRequest[]> {
  try {
    const response = await API.get<CustomQuoteRequest[]>("/quotes/me", { headers: authHeaders() });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar tus cotizaciones."), { cause: error });
  }
}

export async function getAdminQuoteRequests(): Promise<CustomQuoteRequest[]> {
  try {
    const response = await API.get<CustomQuoteRequest[]>("/quotes");
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudieron cargar las cotizaciones."), { cause: error });
  }
}

export async function saveQuoteRequest(request: CreateQuoteInput) {
  try {
    const response = await API.post<CustomQuoteRequest>("/quotes", request, { headers: authHeaders() });
    return response.data;
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo enviar la cotizacion."), { cause: error });
  }
}

export async function deleteQuoteRequest(id: CustomQuoteRequest["id"]) {
  try {
    await API.delete(`/quotes/${id}`);
  } catch (error) {
    throw new Error(getApiErrorMessage(error, "No se pudo eliminar la cotizacion."), { cause: error });
  }
}
