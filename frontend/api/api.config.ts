import axios from "axios";
import AuthController from "./AuthController";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:3001/api",
  validateStatus: function (status) {
    // Allow handling all HTTP status codes in the `then` block
    return true;
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    try {
      const token = AuthController.getSession();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (err) {
      console.log(err, "@apiConfig");
    }
    return config;
  },
  (err) => Promise.reject(err)
);
