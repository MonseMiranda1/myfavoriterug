export type CustomQuoteRequest = {
  id: string;
  date: string;
  imageName: string;
  size: string;
  wool: string;
  colors: string;
  currency: string;
  comments: string;
  totalClp: number;
};

export const QUOTES_STORAGE_KEY = "my-favorite-rug-quotes";

export function getQuoteRequests(): CustomQuoteRequest[] {
  const rawQuotes = window.localStorage.getItem(QUOTES_STORAGE_KEY);

  if (!rawQuotes) return [];

  try {
    const parsed = JSON.parse(rawQuotes);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveQuoteRequest(request: Omit<CustomQuoteRequest, "id" | "date">) {
  const quotes = getQuoteRequests();
  const nextRequest: CustomQuoteRequest = {
    ...request,
    id: `COT-${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString(),
  };

  window.localStorage.setItem(QUOTES_STORAGE_KEY, JSON.stringify([nextRequest, ...quotes]));
  return nextRequest;
}
