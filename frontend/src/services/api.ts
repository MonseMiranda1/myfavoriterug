import axios from "axios";
import { localProducts } from "../data/products";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  category?: string;
  collection?: string;
  bestSeller?: boolean;
  newArrival?: boolean;
};

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

export const getProducts = () =>
  API.get<Product[]>("/products").catch(() => Promise.resolve({ data: localProducts }));
