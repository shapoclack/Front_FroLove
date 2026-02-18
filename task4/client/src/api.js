import axios from "axios";

const client = axios.create({
  baseURL: "http://localhost:3000/api",
  headers: {
    "Content-Type": "application/json"
  }
});

export const api = {
  getProducts() {
    return client.get("/products").then((res) => res.data);
  },
  getProduct(id) {
    return client.get(`/products/${id}`).then((res) => res.data);
  },
  createProduct(payload) {
    return client.post("/products", payload).then((res) => res.data);
  },
  updateProduct(id, payload) {
    return client.patch(`/products/${id}`, payload).then((res) => res.data);
  },
  deleteProduct(id) {
    return client.delete(`/products/${id}`);
  }
};
