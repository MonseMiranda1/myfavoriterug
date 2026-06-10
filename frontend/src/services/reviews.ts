import { API } from "./http";

export type CustomerReview = {
  id: number;
  name: string;
  rating: number;
  comment: string;
  productImage?: string;
  createdAt?: string;
  approved: boolean;
};

export type CustomerReviewInput = {
  name: string;
  rating: number;
  comment: string;
  productPhoto?: File;
};

const localImageHosts = new Set(["localhost", "127.0.0.1", "0.0.0.0"]);

function getApiOrigin() {
  try {
    return new URL(API.defaults.baseURL ?? "", window.location.origin).origin;
  } catch {
    return "";
  }
}

function isLocalPage() {
  if (typeof window === "undefined") return false;

  return localImageHosts.has(window.location.hostname);
}

function resolveReviewImageUrl(image?: string) {
  const trimmedImage = image?.trim();
  const apiOrigin = getApiOrigin();

  if (!trimmedImage || !apiOrigin) return trimmedImage;

  if (trimmedImage.startsWith("/uploads/review-images/")) {
    return apiOrigin + trimmedImage;
  }

  try {
    const imageUrl = new URL(trimmedImage);

    if (!isLocalPage() && localImageHosts.has(imageUrl.hostname)) {
      return apiOrigin + imageUrl.pathname + imageUrl.search + imageUrl.hash;
    }
  } catch {
    return trimmedImage;
  }

  return trimmedImage;
}

function normalizeReview(review: CustomerReview): CustomerReview {
  return {
    ...review,
    productImage: resolveReviewImageUrl(review.productImage),
  };
}

export async function getCustomerReviews() {
  const response = await API.get<CustomerReview[]>("/reviews");
  return response.data.map(normalizeReview);
}

export async function createCustomerReview(input: CustomerReviewInput) {
  const formData = new FormData();
  formData.append("name", input.name);
  formData.append("rating", String(input.rating));
  formData.append("comment", input.comment);

  if (input.productPhoto) {
    formData.append("productPhoto", input.productPhoto);
  }

  const response = await API.post<CustomerReview>("/reviews", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return normalizeReview(response.data);
}

export async function getAdminCustomerReviews() {
  const response = await API.get<CustomerReview[]>("/reviews/admin");
  return response.data.map(normalizeReview);
}

export async function setCustomerReviewApproval(id: number, approved: boolean) {
  const response = await API.put<CustomerReview>(`/reviews/${id}/approval`, null, { params: { approved } });
  return normalizeReview(response.data);
}

export async function deleteCustomerReview(id: number) {
  await API.delete(`/reviews/${id}`);
}
