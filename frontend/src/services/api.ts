import axios from "axios";

export type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
};

const API = axios.create({
  baseURL: "http://localhost:8080/api"
});

export const getProducts = () => API.get<Product[]>("/products");
